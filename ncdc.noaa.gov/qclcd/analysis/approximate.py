#!/usr/bin/python

import sys
import scipy.io
import sklearn.decomposition
import numpy as np

def rmse(X, Y):
    return np.sqrt(np.mean(np.multiply(X - Y, X - Y)))

def main():
    if len(sys.argv) < 3:
        print "Usage: %s input.mat output.mat" % sys.argv[0]
        exit(1)

    input_filename = sys.argv[1]
    output_filename = sys.argv[2]

    matrices = scipy.io.loadmat(input_filename)
    precip = matrices["precip"]

    results = dict()
    features = range(1, 10)
    for n_components in features:
        nmf = sklearn.decomposition.NMF(n_components)

        W = nmf.fit_transform(precip)
        H = nmf.components_

        print "%3d: rmse = %0.4f" % (n_components, rmse(W.dot(H), precip))

        results["W%d" % n_components] = W
        results["H%d" % n_components] = H

    results["features"] = np.array(features)
    results["locations"] = matrices["locations"]
    results["wbans"] = matrices["wbans"]
    results["datetimes"] = matrices["datetimes"]

    scipy.io.savemat(output_filename, results)

if __name__ == "__main__":
    main()
