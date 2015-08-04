SHELL := /bin/bash

include Makefile.urls

define gen_reg_csv
gen/reg/$1.csv: download/reg/$1.csv
	@mkdir -p $$(dir $$@)
