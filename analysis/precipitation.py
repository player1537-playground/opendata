#!/usr/bin/python

import sys
import scipy.io
import numpy as np
import collections

def get_location_mapping(filename):
    d = {}
    with open(filename, "r") as f:
        _ = next(f)

        for line in f:
            row = line.strip().split('|')
            wban = row[0]
            latitude = float(row[9])
            longitude = float(row[10])

            d[wban] = (latitude, longitude)

    return d

def main():
    if len(sys.argv) < 4:
        print "Usage: %s precip.csv station.csv output.mat" % sys.argv[0]
        exit(1)

    precip_filename = sys.argv[1]
    station_filename = sys.argv[2]
    output_filename = sys.argv[3]

    data = collections.defaultdict(lambda: collections.defaultdict(float))
    with open(precip_filename, "r") as f:
        _ = next(f)

        for line in f:
            row = line.strip().split(',')
            wban = row[0]
            date = row[1]
            hour = row[2]
            agregate = date + hour
            try:
                precip = float(row[3])
            except:
                precip = 0

            data[wban][agregate] += precip

    rows = sorted(data.keys())
    cols = sorted(set(key for d in data.itervalues() for key in d.iterkeys()))

    location_mapping = get_location_mapping(station_filename)

    locations = np.array([location_mapping[wban] for wban in rows])
    print locations[1:5, :]

    row_mapping = { value: index for index, value in enumerate(rows) }
    col_mapping = { value: index for index, value in enumerate(cols) }

    mat = np.zeros((len(rows), len(cols)))
    for row in data:
        for col in data[row]:
            mat[row_mapping[row]][col_mapping[col]] = data[row][col]

    data = {
        "precip": mat,
        "wbans": rows,
        "datetimes": cols,
        "locations": locations
    }

    scipy.io.savemat(output_filename, data)

if __name__ == "__main__":
    main()
