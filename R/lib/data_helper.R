# Functions for data cleaning/transformation of APT data
# Gabrielle Schroeder
# November 2024

library('readxl')
library('dplyr')
library('janitor')
library('lubridate')

# Load data and format years
load_apt_data <- function(file_apt) {
  
  data_apt <- readxl::read_xlsx(
    file_apt, 
    sheet = 1, 
    # load date column as numeric since mix of numeric and date formats
    col_types = c("text", "text", "text", "text", "numeric")
  ) 
  data_apt <- janitor::clean_names(data_apt)
  
  # Date column was a mix of date and numeric format. By loading as numeric, dates
  # have been transformed to numbers >> the actual year. We'll convert those high 
  # values back to dates and get the year for downstream analysis.
  data_apt <- data_apt |>
    mutate(
      date = case_when(
        # Convert high numbers (>2100) back to dates and extract the year
        date > 2100 ~ lubridate::year(janitor::convert_to_date(date, character_fun = lubridate::ymd)),
        # If less than 2100, already encodes the year and no transformation needed
        TRUE ~ date)
    )
  
  return(data_apt)
}


# For initialising individual indicator time series tibbles
initialise_ind_ts_data <- function(data_apt, ind_years, ind_old, ind_new, n_levels) {
  
  col_extra <- c("indicator", "n_levels", "region", "country")
  n_countries <- length(unique(data_apt$country))
  
  ind_ts_data <- as_tibble(matrix(0, nrow = n_countries, ncol = length(ind_years) + length(col_extra)), 
                           .name_repair = ~c(col_extra, ind_years))
  data_apt_ind <- data_apt |>
    filter(indicator == ind_old)
  ind_ts_data$indicator <- ind_new
  ind_ts_data$n_levels <- n_levels
  ind_ts_data$region <- data_apt_ind$region
  ind_ts_data$country <- data_apt_ind$country
  
  return(ind_ts_data)

}

# Record if indicator was present each year
add_if_indicator_present_to_ind_ts_data <- function(
    data_apt,
    ind_years,
    ind_old,
    ind_ts_data, 
    ind_val = 1 # Value to use if present
) {
  
  # original data for old indicator
  data_apt_ind <- data_apt |>
    filter(indicator == ind_old)
  
  col_shift <- length(colnames(ind_ts_data)) - length(ind_years)
  
  # 1 if indicator was present each year
  for (j in 1:nrow(data_apt_ind)) { # loop through countries 
    year_j <- data_apt_ind$date[j]
    if (is.na(year_j)) {next} # no year --> skip
    else if (year_j < ind_years[1]) { # before 1984 --> all 1's
      ind_ts_data[j, -(1:col_shift)] <- ind_val
    } else { # 1's from year_j
      idx <- match(year_j, ind_years)
      ind_ts_data[j, (idx + col_shift):(length(ind_years) + col_shift)] <- ind_val
    }
  }
  
  return(ind_ts_data)
}

# For creating time series data from individual indicator arrays
pivot_and_bind_ts_data <- function(data_all, data_ind_wide) {
  
  data_ind_long <- pivot_longer(
    data_ind_wide,
    col = matches("^\\d{4}$"),
    names_to = c("year")
  )
  
  # If no existing larger tibble, create
  if (is.null(data_all)) {
    data_all <- data_ind_long
  } else { # otherwise, bind rows
    data_all <- bind_rows(data_all, data_ind_long)
  }
  
  return(data_all)
}

