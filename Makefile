SHELL := /bin/bash

.PRECIOUS: gen/precip/%.mat
gen/precip/%.mat: data/%/precip.csv data/%/station.csv
	@mkdir -p $(dir $@)
	python -m analysis.precipitation $^ $@

.PRECIOUS: gen/precip_approx/%.mat
gen/precip_approx/%.mat: gen/precip/%.mat
	@mkdir -p $(dir $@)
	python -m analysis.approximate $^ $@

.PHONY: clean
clean:
	rm -f -- $(wildcard *~) $(wildcard **/*~) $(wildcard **/**/*~)
	rm -f -- $(wildcard *.pyc) $(wildcard **/*.pyc) $(wildcard **/**/*.pyc)
