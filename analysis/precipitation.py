#!/usr/bin/python

import sys
import scipy.io
import numpy as np
import collections

def main():
    if len(sys.argv) < 3:
        print "Usage: %s input.csv output.mat" % sys.argv[0]
        exit(1)

    input_filename = sys.argv[1]
    output_filename = sys.argv[2]

    data = collections.defaultdict(lambda: collections.defaultdict(float))
    with open(input_filename, "r") as f:
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

    row_mapping = { value: index for index, value in enumerate(rows) }
    col_mapping = { value: index for index, value in enumerate(cols) }

    mat = np.zeros((len(rows), len(cols)))
    for row in data:
        for col in data[row]:
            mat[row_mapping[row]][col_mapping[col]] = data[row][col]

    scipy.io.savemat(output_filename, { "precip": mat })

if __name__ == "__main__":
    main()
