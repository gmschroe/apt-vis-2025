# Initial exploration and checks of the APT data
# Gabrielle Schroeder
# November 2024

rm(list = ls())
library('readxl')
library('dplyr')
library('janitor')
library('lubridate')
library('stringr')
library('ggplot2')
library('tidyr')
library('rlang')

file_apt <- file.path('data', 'APT_data-info-dictionary_final.xlsx')
data_apt <- load_apt_data(file_apt)

View(data_apt)

# Possible values ----

indicators <- unique(data_apt$indicator)
indicators
countries <- sort(unique(data_apt$country))
countries
regions <- unique(data_apt$region)
regions
inputs <- unique(data_apt$input)
inputs

dates <- sort(unique(data_apt$date))
dates

# date range
min(data_apt$date, na.rm = TRUE)
max(data_apt$date, na.rm = TRUE)

# Check for any yes or partial, but no date
data_missing_year <- data_apt |>
  filter(
    (input == "Yes" | input == "Partially") & is.na(date)
  )
View(data_missing_year)

# Check data with missing input value, even though there is a date
data_missing_input <- data_apt |>
  filter(is.na(input) & !is.na(date)) |>
  arrange(date)
View(data_missing_input)

# Check for operationality of the national torture prevention mechanism, but no
# designation
data_apt_wide = data_apt |> 
  tidyr::pivot_wider(id_cols = country, names_from = indicator, values_from = input)
data_apt_wide <- janitor::clean_names(data_apt_wide)

View(data_apt_wide)
ind_operational = "operationality_of_the_national_preventive_mechanism"
ind_designation = "designation_of_the_national_preventive_mechanism_in_law"
data_designated_but_no_operational_input <- data_apt_wide |>
  filter((!!rlang::sym(ind_designation) == "Yes") & is.na(!!rlang::sym(ind_operational)))
View(data_designated_but_no_operational_input |> select("country", ind_designation, ind_operational))

# Check for operationality input, but no designation
data_not_designated_but_operational_input <- data_apt_wide |>
  filter((!!rlang::sym(ind_designation) != "Yes") & !is.na(!!rlang::sym(ind_operational)))
View(data_not_designated_but_operational_input |> select("country", ind_designation, ind_operational))


# Dates that precede when indicator was implemented ----

# UN Convention against Torture adopted in 1984
View(
  data_apt |>
    filter(indicator == indicators[1] & date < 1984)
)

# UN Optional Protocol adopted in 2002
View(
  data_apt |>
    filter(indicator == indicators[2] & date < 2002)
)

# submission of report to CAT
View(
  data_apt |>
    filter(indicator == indicators[3] & date < 1984)
)

# NPM laid out in Optional Protocal (2002)
View(
  data_apt |>
    filter(indicator == indicators[6] & date < 2002)
)

# Paris Principles adopted in  1993
View(
  data_apt |>
    filter(indicator == indicators[8] & date < 1993)
)


# Number of countries with each indicator on each date ----

# Add boolean columns for yes, no, and partial
data_apt <- data_apt |>
  dplyr::mutate(
    is_yes = (input == "Yes"),
    is_no = (input == "No"),
    is_partially = (input == "Partially")
  )

# For each indicator, number of countries with "yes" for each date 
data_apt_date <- data_apt |>
  filter(!is.na(date)) |> # remove NA dates
  filter(is_yes) |> # only "yes" entries
  group_by(indicator, date) |>
  summarise(n_countries = n()) |>
  ungroup()

# Cumulative number of countries
data_apt_date <- data_apt_date |>
  group_by(indicator) |>
  arrange(indicator, date) |>
  mutate(cumulative_n_countries = cumsum(n_countries))

View(data_apt_date) 

# Plot: number of countries vs time ----

ggplot(data = data_apt_date, mapping = aes(x = date, y = cumulative_n_countries)) +
  facet_wrap(vars(indicator)) +
  geom_line() +
  xlim(c(1984, max(dates)))
