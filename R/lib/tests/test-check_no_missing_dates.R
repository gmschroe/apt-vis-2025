# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))

test_that("no missing dates in test data", {
  dates_specified <- check_no_missing_dates(data_apt)
  expect_true(dates_specified)
})


test_that("missing dates in modified test data identified", {
  # First three entries have date - remove
  data_apt_modified <- data_apt
  data_apt_modified$date[1:3] <- NA
  
  dates_specified <- check_no_missing_dates(data_apt_modified)
  expect_false(dates_specified)
})