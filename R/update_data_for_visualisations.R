# Script to run the data calculations and formatting steps on a new version of 
# the APT indicator data, then save the formatted data and launch the updated
# visualisation.
# Your working directory must be the "vfsg-apt/R/" folder.
#
# Gabrielle M. Schroeder
# March 2025

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
#     "data_apt_bar.csv", in the specified folder and, by default, also copy 
#     them to the Javascript visualisation folders. The visualisation code will 
#     now use the new data.
#
# This script will also launch the updated Javascript visualisation locally 
# using a web browser so you can view the changes.
#
# Note that if the data validation checks fail, the script will stop and the 
# data will NOT be updated. See repository README for example of failed check.

# Prep -------------------------------------------------------------------------

# Clear workspace
rm(list = ls())

# Load functions for data formatting and calculations.
# (This file also loads necessary libraries.)
source(file.path("lib", "data_formatting.R"))

# Update this section for new data ---------------------------------------------

# Name of your Excel file. Must be a file in the "data" folder.
apt_data_file_name <- "APT_data-info-dictionary_final.xlsx"

# Desired name of output folder - will be created inside the existing 
# "data_exports" folder.
# Today's date will also be added as a prefix to the folder's name.
output_dir <- "original_data"

# Update data and save in vfsg-apt/R/data_exports and vfsg-apt/docs/data -------

# Full path to file

# Create data frames with reformatted data.
# start_year = the lower limit for the year axis on the charts
# If you do NOT want to update the visualisation data yet, you can set 
# save_to_vis_dir to FALSE (but must be TRUE to apply the new data to the 
# visualisation)
apt_dataframes <- format_and_save_apt_data(
  apt_data_file_name, 
  output_dir, 
  start_year = 1984,
  save_to_vis_dir = TRUE
)

# Optional: view the reformatted data in RStudio
View(apt_dataframes$data_apt_bar)
View(apt_dataframes$data_apt_radial)

# View the visualisation with the update data ----------------------------------
# This code uses the data in vfsg-apt/docs/data - save_to_vis_dir must be set to
# TRUE for the visualisation to reflect the updated data files.
# The visualisation will be launched in your browser.
# Because we're using the httw (w for "watch") function, this launched page 
# should also update if any changes are made inside the docs folder during this
# R session, even if this code is not re-run, until the page is closed.

# You can also run the below code without updating the data - it will use the
# data last saved to the vfsg-apt/docs/data folder.

# Library for viewing visualisation locally in web browser 
library(servr)

# Launch vis
vis_path <- file.path("..", "docs")
servr::httw(dir = vis_path)
