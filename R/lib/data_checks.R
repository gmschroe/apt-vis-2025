# Functions for checking validity of APT data
# The individual checks do not throw errors, as we want to run all the checks
# even if earlier checks fail.

# Helper functions
source(file.path("lib", "data_helper.R"))

# Check that indicators match specified list.
# Ensures correct mapping to new indicators when formatting data.
check_indicators_are_correct <- function(
    ind # list of indicators - can create using unique(data_apt$indicator)
  ) {
  
  cat("\nCHECKING INDICATORS...\n")
  
  # vector of correct indicators 
  ind_correct <- c(
    "Ratification of the UN Convention against Torture",                                       
    "Ratification of Optional Protocol (OPCAT)",                                              
    "Submission of initial report to CAT",                                                  
    "Prohibition of torture in the constitution",                                            
    "Criminalisation of torture under domestic law",                                           
    "Designation of the National Preventive Mechanism (in law)",                               
    "Operationality of the National Preventive Mechanism",                                     
    "Existence of National Human Rights Institution that fully complies with Paris Principles"
  )
  
  ind_are_correct <- identical(ind, ind_correct)
  
  if (ind_are_correct){
    cat("PASS: Indicators have the correct names and are in the correct order.\n")
  } else {
    cat("FAIL: Indicators are not correct (due to incorrect names and/or order).\n")
    cat("New indicators:\n")
    print(ind)
    cat("Required indicators:\n")
    print(ind_correct)
  }
  
  return(ind_are_correct)
  
}