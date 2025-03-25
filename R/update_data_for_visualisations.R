# Script to run the data calculations and formatting steps on a new version of 
# the APT indicator data.
# Run from within the "vfsg-apt/R/" folder

# Steps to update:
# 1) Add an xlxs file with the updated data to the "vfsg-apt/R/data/" folder. 
#     (If your data is in a different format, you can upload it to Google Sheets
#     and then export it in the required format.)
# 2) Update "apt_data_file_name" in this script to the name of the xlxs file.
# 3) Update "output_dir" to the desired name of the folder for the reformatted data.
#     This name will be prepended with today's date. If you re-run the script
#     with the same folder name on the same day, the files in the output folder
#     will be overwritten.
# 4) Run this script. It will create two CSV files, "data_apt_radial.csv" and 
#     "data_apt_bar.csv", in the specified folder and also copy them to the
#     Javascript visualisation folders. The visualisation code will now use the 
#     new data

# Prep -------------------------------------------------------------------------

# Clear workspace
rm(list = ls())

# Load functions for data formatting and calculations
# (This file also loads necessary libraries)
source(file.path("lib", "data_formatting.R"))

# Additional packages
library("fs")

# Update this section for new data ---------------------------------------------

# Name of your Excel file
# Must be a file in the "data" folder
apt_data_file_name <- "APT_data-info-dictionary_final.xlsx"

# Fake update!
# Barbados 1 - 2026
# Cambodia NMP full - 2027
#apt_data_file_name <- "apt_data_fake_update.xlsx"


# Desired name of output folder 
# will be created inside the existing "data_exports" folder)
# Today's date will also be added as a prefix to the folder's name
output_dir <- "original_data"

# Update data ------------------------------------------------------------------

# Full path to file
apt_data_path <- file.path('data', apt_data_file_name)

# Create data frames with reformatted data
apt_dataframes <- format_apt_data(apt_data_path, start_year = 1984)

# Optional: view the reformatted data
View(apt_dataframes$data_apt_bar)
View(apt_dataframes$data_apt_radial)

# Save data --------------------------------------------------------------------

# Add today's date and the parent directory to output directory
output_dir_with_date <- file.path(
  "data_exports", paste(Sys.Date(), output_dir, sep="_")
)

# Save as CSV files in output directory
apt_csv_files <- save_apt_data(apt_dataframes, output_dir_with_date)

# Copy to Javascript visualisation folder
js_dir <- file.path("..", "docs", "data") # Data folder for visualisation code
fs::dir_copy(
  output_dir_with_date,
  js_dir,
  overwrite = TRUE
)


