# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))


test_that("operational NPMs are designated in test data", {
  operational_npm_also_designated <- check_no_operational_npms_without_designatation(data_apt)
  expect_true(operational_npm_also_designated)
})

test_that("adding operational NPM without designation makes check fail", {
  # get rows for indicator 7 (second NPM indicator)
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[7])
  
  # make first entry operational
  data_apt_modified <- data_apt
  data_apt_modified$input[ind_rows[1]] <- "Yes"
  operational_npm_also_designated <- check_no_operational_npms_without_designatation(data_apt_modified)
  expect_false(operational_npm_also_designated)
  
})

test_that("removing designation from operational NPM makes check fail", {
  # get rows for indicator 6 that are yes
  ind <- unique(data_apt$indicator)
  ind_rows <- which((data_apt$indicator == ind[6]) & (data_apt$input == "Yes"))

  # make first five entries not designated
  data_apt_modified <- data_apt
  data_apt_modified$input[ind_rows[1:5]] <- "No"
  operational_npm_also_designated <- check_no_operational_npms_without_designatation(data_apt_modified)
  expect_false(operational_npm_also_designated)
  
})