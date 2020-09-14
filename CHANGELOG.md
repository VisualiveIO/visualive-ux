# Changelog


## 2.0.0 (2020-09-14)


### ⚠ BREAKING CHANGES

* **npm:** Raw imports are no longer supported.


### Features

* ParameterValueChange now support nested changes. This makes it possible to append more changes to a simple value change command.


### Bug Fixes

* HandleShader


### build

* **npm:** Add UMD support


## 1.5.0 (2020-08-27)


### Features

* ParameterValueChange now supports nested changes.


### Bug Fixes

* Docs search now have their own namespace.
* Generated docs for tools.
* Generated docs, they were removed in a previous commit.


## 1.4.0 (2020-08-20)


### Features

* ArcSlider can now be connected to a NumberParameter.
* Formalized documentation for UX lib.


### Bug Fixes

* Addressed compatibility issue with zea-web-components that it is not constructing Change objects.
* ArcSlider's Radius param name.
* Docs for classes under UndoRedo module.
* Bug causing Handle geoms to be flipped in the view.
* Coverage file.
* Regression caused by clamp now is MathFunctions.
* Regression in display of arc geometry in the ArcSlider.
* Regressions due to new captialization of parameter names.
* Tools dir name.
* UndoRedo dir name.
* UndoRedo import.
