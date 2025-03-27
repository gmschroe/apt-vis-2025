# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))

test_that("no missing input values in test data", {
  input_values_specified <- check_no_missing_input_values(data_apt)
  expect_true(input_values_specified)
})


test_that("missing input values in modified test data identified", {
  # First three entries have input values and date - remove input values
  data_apt_modified <- data_apt
  data_apt_modified$input[1:3] <- NA
  
  input_values_specified <- check_no_missing_input_values(data_apt_modified)
  expect_false(input_values_specified)
})