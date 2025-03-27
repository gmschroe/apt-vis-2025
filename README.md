# Viz For Social Good: Association for the Prevention of Torture

## About 

Code for my VFSG submission for its [collaboration with the Association for the Prevention of Torture](https://www.vizforsocialgood.com/join-a-project/2024/7/26/apt)

See the visualisations at
- [Webpage](https://www.gmschroeder.com/vfsg-apt/)
- [Blog post](https://www.gmschroeder.com/data_vis/vfsg-apt-blog/)

I used R for data exploration and cleaning/transformations, then Javascript/HTML/CSS (including D3.js) for the visualisation. The R code is contained in the `R` subfolder, while the visualisation code is in the `docs` subfolder.

## Running locally

### Updating APT data on torture prevention indicators

1) open project (R/R.Rproj) in RStudio using R version 4.2.2 (I recommend using [`rig`](https://github.com/r-lib/rig) if you need to manage multiple R versions on your computer). Your working directory should be `[your local paths]/vfsg-apt/R`. You can check your working directory using `getwd()` in the R console.
2) I use `renv` to manage the package versions used in the project. Restore the project's `renv` environment using `renv::restore()` in the R console. If any packages in the lockfile are not installed, follow the outputted `renv` instructions to install them.
3) Open `vfsg-apt/R/update_data_for_visualisation.R` and follow the instructions in the script ("Steps to update") for providing a new data file, formatting that data, and saving the new data in the required format. This script will also update the data used by the visualisation and open the new version of the visualisation in a web browser. 
TODO: Can also use rig to launch the correct R version 

### Visualising the data

The visualisation code does not require a package manager such as NPM - it uses a `<script>` element to add the D3.js dependency to the project.


To run the visualisation website locally in a web browser, you can 

1) Use R: first follow steps 1-2 above for updating the APT code, and then run the last section of `vfsg-apt/R/update_data_for_visualisation.R`:

```
# Library for viewing visualisation locally in web browser 
library(servr)

# Launch vis
vis_path <- file.path("..", "docs")
servr::httw(dir = vis_path)
```

which will open the visualisation using the last version of the data that was saved to the visualisation folders.

(Running the entire script should also work, assuming the last specified data file is valid - it will just unnecessarily repeat the validation checks and data formatting.)

2) Use VSCode: Alternatively, you can open the `vfsg-apt/docs/` folder in [Visual Studio Code](https://code.visualstudio.com/) and use the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to launch the visualisation in a web browser.


## Deploying

The website is deployed using [GitHub Pages](https://docs.github.com/en/pages), with the `docs` folder (which contains the visualisation code) configured as the [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Any updates to the `docs` folder in the main branch of the repo will update this website.


## Running tests

There are limited unit tests for the data validity checks in `R/lib/tests`. These tests can be run by following the above instructions (steps 1-2 in "Updating APT data on torture prevention indicators") to open the project in R, then running 

```
testthat::test_dir(file.path("lib", "tests"))
```

Note that **these tests are designed to test the code - they do NOT perform any checks on the data**. They are useful if you want to further develop this codebase and verify that your changes have not broken existing functionality.
