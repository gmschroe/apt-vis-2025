# Functions for calculations and formatting of APT data for visualisations

library('dplyr')
library('stringr')
library('ggplot2')
library('tidyr')
library('rlang')
library("fs")

source(file.path("lib", "data_helper.R"))
source(file.path("lib", "data_checks.R"))


#' Wrapper function for formatting and saving the updated APT data on indicators
#' for torture prevention.
#'
#' @param file_apt Name of the .xlsx file (not the full path - file must be in 
#' the 'vfsg-apt/R/data' folder)
#' @param output_dir Name of the folder in which to save the formatted data - 
#' will be created inside the 'vfsg-apt/R/data-exports' folder and also 
#' prepended with today's data.
#' @param start_year Year that visualisations should start (int, default = 1984)
#' @param save_to_vis_dir Whether to also copy the new formatted data files to 
#' 'vfsg-apt/docs/data' to use for the Javascript visualisation (bool, default =
#' TRUE). The existing files in this folder will be overwritten by the new files. 
#' 
#' @return Named list with three entries contained the APT data:
#'   "data_apt": Data frame of the original APT data, cleaned.
#'   "data_apt_radial": Data frame for te radial chart, with the level of each 
#'     indicator in each country for every year from start_year.
#'   "data_apt_bar": Data for bar chart - similar to data_apt_radial, but for
#'     indicators with multiple levels, there is a separate row for each level 
#'     indicating (true or false) if the indicator is at that level for that
#'     country in each year.
#' @export
format_and_save_apt_data <- function(
    file_apt, 
    output_dir, 
    start_year = 1984,
    save_to_vis_dir = TRUE
  ) {
  
  # UPDATE DATA 
  
  # Full path to file
  apt_data_path <- file.path('data', apt_data_file_name)
  
  # Create data frames with reformatted data
  apt_dataframes <- format_apt_data(apt_data_path, start_year = start_year)
  
  # SAVE DATA
  
  # Add today's date and the parent directory to output directory
  output_dir_with_date <- file.path(
    "data_exports", paste(Sys.Date(), output_dir, sep="_")
  )
  
  # Save as CSV files in output directory
  apt_csv_files <- save_apt_data(apt_dataframes, output_dir_with_date)
  
  # Copy to Javascript visualisation folder if save_to_vis_dir is TRUE
  if (save_to_vis_dir) {
    js_dir <- file.path("..", "docs", "data") # Data folder for visualisation code
    fs::dir_copy(
      output_dir_with_date,
      js_dir,
      overwrite = TRUE
    )
    cat("\nSAVED DATA COPIED TO VISUALISATION FOLDER\n")
  }
  # OUTPUT 
  
  # Return data frames (for optional inspection in RStudio)
  return(apt_dataframes)
  
}

#' Function for calculations and formatting of APT data for visualisations
#' 
#' Dev note: Large function, would benefit from being broken down into smaller 
#' steps.
#'
#' @param file_apt Path to .xlsx file of APT data (string)
#' @param start_year Year that visualisations should start (int, default = 1984)
#'
#' @return Named list with three entries:
#'   "data_apt": Data frame of the original APT data, cleaned.
#'   "data_apt_radial": Data frame for te radial chart, with the level of each 
#'     indicator in each country for every year from start_year.
#'   "data_apt_bar": Data for bar chart - similar to data_apt_radial, but for
#'     indicators with multiple levels, there is a separate row for each level 
#'     indicating (true or false) if the indicator is at that level for that
#'     country in each year.
#' @export
format_apt_data <- function(
    file_apt, # Path to .xlsx file of APT data
    start_year = 1984 # Lower limit for year in plots
  ) {
    
  # Load data ----
  data_apt <- load_apt_data(file_apt)
  
  # Run data checks ----
  check_apt_data(data_apt)
  
  # Format data
  cat("\nFORMATTING DATA FOR VISUALISATIONS\n")
  
  # Old and new indicators ----
  ind <- unique(data_apt$indicator) # original indicators
  
  ind_new <- c(
    "ind1_uncat",
    "ind2_opcat",
    "ind3_report",
    "ind4_constitution",
    "ind5_law", # two levels: yes and partial
    "ind6_npm", # two levels, combines original indicators 6 and 7
    "ind7_paris"
  )
  
  # Does each indicator have a direct mapping to an original indicator, with one level?
  ind_has_direct_mapping <- rep(1, length(ind_new))
  ind_has_direct_mapping[ind_new == "ind5_law"] <- 0 # no - law indicator has two levels
  ind_has_direct_mapping[ind_new == "ind6_npm"] <- 0 # no - NPM indicator has two levels, which combine to original indicators
  
  # Equivalent old indicator (only for indicators with direct mapping)
  ind_old_equiv <- ind[c(1, 2, 3, 4, 5, 6, 8)]
  ind_old_equiv[ind_has_direct_mapping == 0] = NA 

  # Create table indicating if each indicator was present in each year that will ----
  # be plotted 
  
  # Years to plot
  ind_years <- seq(start_year, max(data_apt$date, na.rm = TRUE))
  
  # Create time series array for each indicator with direct mapping
  data_apt_ts <- NULL # will become array for all ind
  for (i in 1:length(ind_new)){
    
    # Indicators with direct mapping
    if (ind_has_direct_mapping[i]) {
      # Initialise array
      ind_ts_data <- initialise_ind_ts_data(
        data_apt,
        ind_years = ind_years,
        ind_old = ind_old_equiv[i],
        ind_new = ind_new[i],
        n_levels = 1
      )
      
      # 1 if indicator was present each year
      ind_ts_data <- add_if_indicator_present_to_ind_ts_data(
        data_apt,
        ind_years = ind_years,
        ind_old = ind_old_equiv[i],
        ind_ts_data = ind_ts_data
      )
      
      # Pivot so each data for each year is stored as a row
      data_apt_ts <- pivot_and_bind_ts_data(data_apt_ts, ind_ts_data)
    }
  }

  # Add domestic law indicator with two levels for "Partially" and "Yes" ----
  # For this indicator, we do not need to take into account "partially" converting
  # to "yes"
  
  # Initialise array
  ind_new_laws <- "ind5_law"
  ind_old_laws <- "Criminalisation of torture under domestic law"
  ind_ts_data <- initialise_ind_ts_data(
    data_apt,
    ind_years = ind_years,
    ind_old = ind_old_laws,
    ind_new = ind_new_laws,
    n_levels = 2
  )
  
  data_apt_ind <- data_apt |>
    filter(indicator == ind_old_laws)
  
  # 1 = "Partially" present, 2 = "Yes"
  col_shift <- length(colnames(ind_ts_data)) - length(ind_years)
  for (j in 1:nrow(data_apt_ind)) { # loop through countries
    input <- data_apt_ind$input[j]
    if (input == "Yes") {
      input_val <- 2
    } else if (input == "Partially") {
      input_val <- 1
    }
    year_j <- data_apt_ind$date[j]
    if (is.na(year_j)) {next} # no year --> skip
    else if (year_j < ind_years[1]) { # before 1984 --> all 1's or 2's
      ind_ts_data[j, -(1:col_shift)] <- input_val
    } else { # 1's or 2's from year_j
      idx <- match(year_j, ind_years)
      ind_ts_data[j, (idx + col_shift):(length(ind_years) + col_shift)] <- input_val
    }
  }
  
  # Pivot and bind
  data_apt_ts <- pivot_and_bind_ts_data(data_apt_ts, ind_ts_data)
  
  rm(list = c("data_apt_ind", "ind_new_laws", "ind_old_laws", "ind_ts_data"))
  
  # Add NPM indicator with two levels for "Designated only" and "Designated AND Operational" ----
  # For this indicator, we DO need to take into account that countries can switch
  # from level one (designated) to level 2 (designated and operational)
  ind_new_npm <- "ind6_npm"
  ind_old_npm1 <- ind[6] # Level 1 for NPM (partial implementation)
  ind_old_npm2 <- ind[7] # Level 2 for NPM (full implementation)

  # Initialise array using first NPM indicator
  ind_ts_data <- initialise_ind_ts_data(
    data_apt,
    ind_years = ind_years,
    ind_old = ind_old_npm1,
    ind_new = ind_new_npm,
    n_levels = 2
  )
  
  # Start by adding 1's for years when designated 
  ind_ts_data <- add_if_indicator_present_to_ind_ts_data(
    data_apt,
    ind_years = ind_years,
    ind_old = ind_old_npm1, # Indicator for designated
    ind_ts_data = ind_ts_data,
    ind_val = 1
  )
  
  # Replace with 2's when operational
  # 1 is now designated only
  ind_ts_data <- add_if_indicator_present_to_ind_ts_data(
    data_apt,
    ind_years = ind_years,
    ind_old = ind_old_npm2, # Indicator for operational
    ind_ts_data = ind_ts_data,
    ind_val = 2
  )
  
  # Pivot and bind
  data_apt_ts <- pivot_and_bind_ts_data(data_apt_ts, ind_ts_data)
  
  rm(list = c("ind_new_npm", "ind_old_npm1", "ind_old_npm2", "ind_ts_data"))
  
  # data_apt_ts can be used for the radial plots ----
  # Create data_apt_ts_separated with separate rows for each level of the multi-level indicators -
  # will use for bar chart
  
  # initialise with single-level indicators
  data_apt_ts_separated <- data_apt_ts |>
    filter(n_levels == 1)
  
  # replace n_levels column with whether a partial level
  data_apt_ts_separated <- data_apt_ts_separated |>
    rename("partial" = n_levels) |>
    mutate("partial" = FALSE) # will not be partial - only one level
  
  # number of levels of each indicator
  ind_levels <- unique(data_apt_ts[,c("indicator", "n_levels")])
  
  # Split indicators with multiple levels
  for (i in 1:nrow(ind_levels)) {
    n_levels_i <- ind_levels$n_levels[i]
    ind_i <- ind_levels$indicator[i]
    if (n_levels_i > 1) {
      for (j in 1:n_levels_i) {
        data_ij <- data_apt_ts |>
          filter(indicator == ind_i) |>
          mutate(value = as.numeric(value == j)) |> # change value to whether equal to the level
          mutate(indicator = paste(indicator, "level", as.character(j), sep="_")) |> # update indicator to include the level
          rename("partial" = n_levels) |> # n_levels becomes partial variable
          mutate(partial = (j < n_levels_i)) # level indicates partial completion if less than the total number of levels
        
        # bind to all data
        data_apt_ts_separated <- bind_rows(data_apt_ts_separated, data_ij)
      }
    }
  }

  cat("\nFINISHED FORMATTING DATA\n")
  
  # Return data frames ----
  return(
    list(
      "data_apt" = data_apt, # Original data, cleaned
      "data_apt_radial" = data_apt_ts, # Data for radial chart
      "data_apt_bar" = data_apt_ts_separated # Data for bar chart
      )
  )
}

#' Save APT dataframes created by format_apt_data
#'
#' @param apt_dataframes Named list of APT dataframes (output from 
#' format_apt_data)
#' @param output_dir Name of directory in which to save dataframes
#'
#' @return Creates two CSV files, "data_apt_radial.csv" and 
#' "data_apt_bar.csv", and returns vector of the paths to those files.
#' @export
save_apt_data <- function(apt_dataframes, output_dir) {
  
  cat("\nSAVING DATA\n")
  
  # Create output directory if it doesn't exist
  dir.create(output_dir, showWarnings = FALSE)
  
  # Save CSV files in directory
  radial_file <- file.path(output_dir, "data_apt_radial.csv")
  write.csv(apt_dataframes$data_apt_radial, radial_file)
  bar_file <- file.path(output_dir, "data_apt_bar.csv")
  write.csv(apt_dataframes$data_apt_bar, bar_file)
  
  cat("\nFINISHED SAVING DATA\n")
  
  return(list.files(output_dir, full.names = TRUE))
}