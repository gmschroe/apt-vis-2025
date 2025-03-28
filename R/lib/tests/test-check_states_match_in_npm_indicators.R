# Set working directory to R directory (two levels up from test directory)
setwd(file.path("..", ".."))

library(testthat)
source(file.path("lib", "data_checks.R"))

# test data
data_apt <- suppressWarnings(load_apt_data(file.path("lib", "tests", "test_apt_data.xlsx")))


test_that("states match in test data", {
  npm_states_match <- check_states_match_in_npm_indicators(data_apt)
  expect_true(npm_states_match)
})

test_that("reordering states makes check fail", {
  # get rows for indicator 6 (first NPM indicator)
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[6])

  # we only need to swap the country column for this check
  data_apt_modified <- data_apt
  data_apt_modified$country[ind_rows] <- rev(data_apt_modified$country[ind_rows]) # reverse order
  
  npm_states_match <- check_states_match_in_npm_indicators(data_apt_modified)
  expect_false(npm_states_match)
})

test_that("changing name of state makes check fail", {
  # get rows for indicator 6 (first NPM indicator)
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[6])
  
  # change name of first state
  data_apt_modified <- data_apt
  data_apt_modified$country[ind_rows[1]] <- "Incorrect name"
  
  npm_states_match <- check_states_match_in_npm_indicators(data_apt_modified)
  expect_false(npm_states_match)
})

test_that("remove states makes check fail", {
  # get rows for indicator 6 (first NPM indicator)
  ind <- unique(data_apt$indicator)
  ind_rows <- which(data_apt$indicator == ind[6])
  
  # remove first row
  data_apt_modified <- data_apt[-c(ind_rows[1]),]

  npm_states_match <- check_states_match_in_npm_indicators(data_apt_modified)
  expect_false(npm_states_match)
})