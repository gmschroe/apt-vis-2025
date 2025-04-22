# Functions for checking validity of APT data
# The individual checks do not throw errors, as we want to run all the checks
# even if earlier checks fail.
# However, some checks only run if previous checks have passed (e.g., we need
# to ensure the indicators are correct before we try to access specific indicators)

# Helper functions
source(file.path("lib", "data_helper.R"))

# Run all checks on the APT data frame and throw error if incorrect
check_apt_data <- function(data_apt) {
  
  cat("\nCHECKING DATA\n")
  
  # Check if indicators are correct
  ind <- unique(data_apt$indicator)
  ind_correct <- check_indicators_are_correct(ind)
  
  # Dates specified for yes/partial entries
  dates_specified <- check_no_missing_dates(data_apt)

    # Input value specified for entries with dates
  input_specified <- check_no_missing_input_values(data_apt)
  
  # Total number of failures for initial checks
  n_fail <- as.numeric(!ind_correct) + 
    as.numeric(!dates_specified) + 
    as.numeric(!input_specified)

  # Only perform indicator-specific checks if indicator names are correct
  if (ind_correct) {
    
    # Check that no dates are before an indicator was implemented
    no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt)
    
    # Check that states match in NPM indicators
    npm_states_match <- check_states_match_in_npm_indicators(data_apt)
    
    # Check that operational NPMs are also designated
    operational_npm_also_designated <- check_no_operational_npms_without_designatation(data_apt)
    
    # Add these checks to number of failures
    n_fail <- n_fail + 
      as.numeric(!no_dates_before_indicator_implemented) + 
      as.numeric(!npm_states_match) + 
      as.numeric(!operational_npm_also_designated)
    
  } else {
    cat("\nCannot perform indicator-specific checks because indicators are incorrect - skipping these checks.\n")
  }
  
  # Raise error if any failures
  if (n_fail > 0) {
    cat("\n", n_fail, " CHECKS FAILED - SEE ABOVE MESSAGES FOR DETAILS\n")
    stop(paste("Cannot format and visualise this data due to", n_fail, "failed checks.\n"))
  } else {
    cat("\nALL CHECKS PASSED!\n")
    cat("Will proceed to data formatting steps.\n")
  }
}

# Check that indicators match specified list.
# Ensures correct mapping to new indicators when formatting data.
check_indicators_are_correct <- function(
    ind # list of indicators - can create using unique(data_apt$indicator)
  ) {
  
  cat("\nCHECKING INDICATORS...\n")
  
  # vector of correct indicators 
  ind_correct <- c(
    "Ratification of the UN Convention against Torture",                                       
    "Ratification of Optional Protocol (OPCAT)",                                              
    "Submission of initial report to CAT",                                                  
    "Prohibition of torture in the constitution",                                            
    "Criminalisation of torture under domestic law",                                           
    "Designation of the National Preventive Mechanism (in law)",                               
    "Operationality of the National Preventive Mechanism",                                     
    "Existence of National Human Rights Institution that fully complies with Paris Principles"
  )
  
  ind_are_correct <- identical(ind, ind_correct)
  
  if (ind_are_correct){
    cat("PASS: Indicators have the correct names and are in the correct order.\n")
  } else {
    cat("FAIL: Indicators are not correct (due to incorrect names and/or order).\n")
    cat("New indicators:\n")
    print(ind)
    cat("Required indicators:\n")
    print(ind_correct)
  }
  
  return(ind_are_correct)
  
}

# Check if any entries are yes or partial, but missing date (i.e., year)
check_no_missing_dates <- function(data_apt) {
  
  cat("\nCHECKING THAT YES/PARTIAL ENTRIES ALL HAVE VALUE FOR DATE...\n")
  
  data_missing_year <- data_apt |>
    filter(
      (input == "Yes" | input == "Partially") & is.na(date)
    )
  n_missing_year <- nrow(data_missing_year)
  if (n_missing_year > 0) {
    cat("FAIL:", n_missing_year, "entries with Yes or Partial values do not have a year specified.\n")
    cat("See data_missing_year dataframe in RStudio viewer to see these entries.\n")
    View(data_missing_year)
  } else {
    cat("PASS: All entries with Yes/Partial values have an implementation date specified.\n")
  }
  
  return(n_missing_year == 0) # TRUE = passed check
  
}

# Check if any data is missing an input value, even though there is a date
check_no_missing_input_values <- function(data_apt) {
  cat("\nCHECKING THAT ENTRIES WITH DATES ALL HAVE INPUT VALUES...\n")
  
  data_missing_input <- data_apt |>
    filter(is.na(input) & !is.na(date)) |>
    arrange(date)
  
  n_missing_input <- nrow(data_missing_input)
  if (n_missing_input > 0) {
    cat("FAIL:", n_missing_input, "entries with dates do not have an input value specified.\n")
    cat("See data_missing_input dataframe in RStudio viewer to see these entries.\n")
    View(data_missing_input)
  } else {
    cat("PASS: All entries with dates have an input value specified.\n")
  }
  
  return(n_missing_input == 0) # TRUE = passed check
}

# Check if any dates preceeding year indicator was implemented
check_no_dates_before_indicator_implemented <- function(data_apt) {
  
  cat("\nCHECKING THAT NO DATES ARE TOO EARLY (I.E., BEFORE INDICATOR WAS CREATED)...\n")
  
  # Check starts off TRUE - will change to FALSE if any indicators fail
  no_dates_before_indicator_implemented <- TRUE
  
  # all indicators
  ind <- unique(data_apt$indicator)
  
  # indicator indices to check
  ind_indices <- c(1, 2, 3, 6, 7, 8)
  
  # corresponding year for each indicator
  ind_years <- c(1984, 2002, 1984, 2002, 2002, 1993)
  
  # number of indices to check
  n_ind <- length(ind_indices)
  
  # initialise array for storing any dates that are too early
  data_date_too_early <- data.frame()
  
  # Check each indicator
  for (i in 1:n_ind) {
    
    # Find any dates that are too early for the indicator
    ind_i <- ind[ind_indices[i]]
    ind_data <- data_apt |>
      filter(indicator == ind_i & date < ind_years[i])
    
    n_too_early <- nrow(ind_data)
    if (n_too_early > 0) {
      # Change check to FALSE (doesn't pass) if any entries that are too early
      no_dates_before_indicator_implemented <- FALSE

      cat(n_too_early, "dates for", ind_i, "are before", ind_years[i], "\n")

      # Append to data_date_too_early
      data_date_too_early <- rbind(data_date_too_early, ind_data)
    } else {
      cat("All dates for", ind_i, "are no earlier than", ind_years[i], "\n")
    }
  }
  
  # Pass if all indicators pass check
  if (no_dates_before_indicator_implemented) {
    cat("PASS: No indicator dates are before the indicator was implemented.\n")
  # Otherwise, show failed entries
  } else {
    cat("FAIL: See data_date_too_early dataframe in RStudio viewer to see entries with dates before indicator was implemented.\n")
    View(data_date_too_early)
  }
  
  return(no_dates_before_indicator_implemented)
}

# Check that states are in the same order in the NPM indicators
check_states_match_in_npm_indicators <- function(data_apt) {
  
  cat("\nCHECKING THAT STATES ARE THE SAME AND HAVE THE SAME ORDER FOR THE NPM INDICATORS...\n")
  
  # all indicators
  ind <- unique(data_apt$indicator)
  
  # NPM indicators
  ind_old_npm1 <- ind[6] # Level 1 for NPM (partial implementation)
  ind_old_npm2 <- ind[7] # Level 2 for NPM (full implementation)
  
  # Check countries are in same order
  data_apt_ind1 <- data_apt |>
    filter(indicator == ind_old_npm1)
  data_apt_ind2 <- data_apt |>
    filter(indicator == ind_old_npm2)
  npm_states_match <- identical(data_apt_ind1$country, data_apt_ind2$country)
  
  if (npm_states_match) {
    cat("PASS: States match for the NPM indicators.\n")
  } else {
    cat(
      "FAIL: States do not match for the NPM indicators",
      "(may be because rows are in a different order, names are different,",
      "or states are missing in one indicator).\n")
  }
  return(npm_states_match)
}

# Check that any operational NPMs are also designated
check_no_operational_npms_without_designatation <- function(data_apt) {
  
  cat("\nCHECKING THAT NO OPERATIONAL NPM ARE MISSING FIRST STEP OF NPM IMPLEMENTATION (DESIGNATATION)...\n")
  
  # Column for each indicator
  data_apt_wide = data_apt |> 
    tidyr::pivot_wider(id_cols = country, names_from = indicator, values_from = input)
  
  # Indicators (with clean names)
  data_apt_wide <- janitor::clean_names(data_apt_wide)
  ind_operational = "operationality_of_the_national_preventive_mechanism"
  ind_designation = "designation_of_the_national_preventive_mechanism_in_law"
  
  # Check for operationality is Yes, but no designation
  data_npm_operational_but_missing_designation <- data_apt_wide |>
    filter((!!rlang::sym(ind_designation) != "Yes") & (!!rlang::sym(ind_operational) == "Yes")) |> 
    select("country", ind_designation, ind_operational) # only keep relevent columns
  
  n_operational_npm_missing_designation <- nrow(data_npm_operational_but_missing_designation)
  if (n_operational_npm_missing_designation > 0) {
    cat("FAIL:", n_operational_npm_missing_designation, "states have NPMs marked as operational, but not designated.\n")
    cat("See n_operational_npm_missing_designation dataframe in RStudio viewer to see these entries.\n")
    View(data_npm_operational_but_missing_designation)
    } else {
    cat("PASS: All operational NPMs are also designated.\n")
  }
  
  return(n_operational_npm_missing_designation == 0) # TRUE = passed check

  
}
