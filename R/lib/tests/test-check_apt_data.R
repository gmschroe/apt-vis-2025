# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))

test_that("checks pass for test data", {
  expect_no_error(check_apt_data(data_apt))
})

test_that("checks fail if indicators incorrect", {
  # Change one indicator entry so that vector of indicators will be incorrect
  data_apt_modified <- data_apt
  data_apt_modified$indicator[1] <- "Incorrect indicator"
  expect_error(check_apt_data(data_apt_modified))
})

test_that("checks fail if dates are not specified for yes/partial entries", {
  data_apt_modified <- data_apt
  data_apt_modified$date[1:3] <- NA
  expect_error(check_apt_data(data_apt_modified))
})

test_that("checks fail if input values are not specified for entries with dates", {
  data_apt_modified <- data_apt
  data_apt_modified$input[1:3] <- NA
  expect_error(check_apt_data(data_apt_modified))
})

test_that("checks fail if indicators incorrect and dates not specified", {
  data_apt_modified <- data_apt
  data_apt_modified$indicator[1] <- "Incorrect indicator"
  data_apt_modified$date[1:3] <- NA
  expect_error(check_apt_data(data_apt_modified))
})

test_that("checks fail if dates too early", {
  data_apt_modified <- data_apt
  data_apt_modified$date[1:3] <- 1900
  expect_error(check_apt_data(data_apt_modified))
})

test_that("checks fail if states do not match for NPM indicators", {
  # get rows for indicator 6 (first NPM indicator)
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[6])
  
  # remove first row
  data_apt_modified <- data_apt[-c(ind_rows[1]),]
  expect_error(check_apt_data(data_apt_modified))
})