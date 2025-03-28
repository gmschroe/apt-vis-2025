# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))

test_that("no early dates in test data", {
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt)
  expect_true(no_dates_before_indicator_implemented)
})

test_that("1983 too early for indicator 1", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[1])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 1983 # modify first three dates 
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})

test_that("2001 too early for indicator 2", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[2])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 2001 # modify first three dates 
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})

test_that("1983 too early for indicator 3", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[3])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 1983 # modify first three dates 
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})

test_that("2001 too early for indicator 6", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[6])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 2001 # modify first three dates 
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})

test_that("2001 too early for indicator 7", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[7])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 2001 # modify first three dates 
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})

test_that("1992 too early for indicator 8", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[8])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 1992 # modify first three dates 
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})

test_that("too early for indicator 1 and 2 fails", {
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[1])
  data_apt_modified <- data_apt
  data_apt_modified$date[ind_rows[1:3]] <- 1983 # modify first three dates 
  
  ind_rows <- which(data_apt$indicator == ind[2])
  data_apt_modified$date[ind_rows[1:3]] <- 2001 # modify first three dates 
  
  no_dates_before_indicator_implemented <- check_no_dates_before_indicator_implemented(data_apt_modified)
  expect_false(no_dates_before_indicator_implemented)
})