SHELL := /bin/bash
BASE_URL := http://www.ncdc.noaa.gov/orders/qclcd
UNZIP := unzip -DD
ZIP_FILES := daily.txt station.txt precip.txt hourly.txt monthly.txt remarks.txt

.SECONDARY:

data/%/data.zip:
	@mkdir -p $(dir $@)
	wget --no-use-server-timestamp $(BASE_URL)/QCLCD$*.zip -O $@

$(addprefix data/%/,$(ZIP_FILES)): data/%/data.zip
	$(UNZIP) -p $< $*$(notdir $@) > $@

data/%/precip.csv: data/%/precip.txt
	ln $< $@

data/%/station.csv: data/%/station.txt
	ln $< $@

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
