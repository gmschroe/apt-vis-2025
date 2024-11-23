# Code for reformatting the APT data in preparation for visualisation using
# Javascript/D3
# Produces two CSV files
# Gabrielle Schroeder
# November 2024

rm(list = ls())
library('dplyr')
library('stringr')
library('ggplot2')
library('tidyr')
library('rlang')

source(file.path("lib", "data_helper.R"))
# Load data ---

file_apt <- file.path('data', 'APT_data-info-dictionary_final.xlsx')
data_apt <- load_apt_data(file_apt)

View(data_apt)

# Old and new indicators ----
ind <- unique(data_apt$indicator) # original

ind_new <- c(
  "ind1_uncat",
  "ind2_opcat",
  "ind3_report",
  "ind4_constitution",
  "ind5_law", # two levels: yes and partial
  "ind6_npm", # two levels, combines indicators 6 and 7
  "ind7_paris"
)

# Direct mapping to old indicator? (with one level)
ind_has_direct_mapping <- rep(1, length(ind_new))
ind_has_direct_mapping[ind_new == "ind5_law"] <- 0
ind_has_direct_mapping[ind_new == "ind6_npm"] <- 0

ind_has_direct_mapping
ind_new[ind_has_direct_mapping == 1]

# Equivalent old indicator (only for indicators with direct mapping)
ind_old_equiv <- ind[c(1, 2, 3, 4, 5, 6, 8)]
ind_old_equiv[ind_has_direct_mapping == 0] = NA
ind_old_equiv

# Create table indicating if each indicator was present in each year that will ----
# be plotted 

# Years to plot
ind_years <- seq(1984, max(data_apt$date, na.rm = TRUE))

# Create time series array for each indicator with direct mapping
data_apt_ts <- NULL # will become array for all ind
for (i in 1:length(ind_new)){

  # Indicators with direct mapping
  if (ind_has_direct_mapping[i]) {
    print(ind_new[i])
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
View(data_apt_ts)

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

# Check countries have same order in both old
ind_new_npm <- "ind6_npm"
ind_old_npm1 <- "Designation of the National Preventive Mechanism (in law)"
ind_old_npm2 <- "Operationality of the National Preventive Mechanism"
data_apt_ind1 <- data_apt |>
  filter(indicator == ind_old_npm1)
data_apt_ind2 <- data_apt |>
  filter(indicator == ind_old_npm2)
if (!identical(data_apt_ind1$country, data_apt_ind2$country)){
  stop("countries must be the same for the NPM indicators")
}

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
# Create data_apt_ts_separated with separate rows for each level of the multi-level indicators

# initialise with single-level indicators
data_apt_ts_separated <- data_apt_ts |>
  filter(n_levels == 1)

# replace n_levels column with whether a partial level
data_apt_ts_separated <- data_apt_ts_separated |>
  rename("partial" = n_levels) |>
  mutate("partial" = FALSE) # will not be partial - only one level

# number of levels of each indicator
ind_levels <- unique(data_apt_ts[,c("indicator", "n_levels")])
ind_levels

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
View(data_apt_ts_separated)

# Save data (CSV) ----
write.csv(data_apt_ts, file.path("data_exports", "data_apt_ts.csv"))
write.csv(data_apt_ts_separated, file.path("data_exports", "data_apt_ts_separated.csv"))

