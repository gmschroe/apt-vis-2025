# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))

test_that("indicators in test data pass indicator check", {
  ind <- unique(data_apt$indicator) # original indicators
  ind_are_correct <- check_indicators_are_correct(ind)
  expect_true(ind_are_correct)
})

test_that("reorder indicators in test data fail indicator check", {
  ind <- unique(data_apt$indicator) # original indicators
  ind <- rev(ind) # reverses indicators
  ind_are_correct <- check_indicators_are_correct(ind)
  expect_false(ind_are_correct)
})

test_that("missing indicator in test data fails indicator check", {
  ind <- unique(data_apt$indicator) # original indicators
  ind <- ind[2:length(ind)] # remove first indicator
  ind_are_correct <- check_indicators_are_correct(ind)
  expect_false(ind_are_correct)
})

test_that("renamed indicator in test data fails indicator check", {
  ind <- unique(data_apt$indicator) # original indicators
  ind[1] <- "Incorrect indicator" # rename first indicator
  ind_are_correct <- check_indicators_are_correct(ind)
  expect_false(ind_are_correct)
})


