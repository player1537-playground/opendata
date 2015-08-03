#!/usr/bin/python

from __future__ import division

import sys
import scipy.io
import collections
import sklearn.decomposition
import numpy as np

def cluster(X=None, U=None, V=None, k=None):
    """Determines clusters of X based on the NMF results with the given rank.

    X should an NxM matrix, where each column represents a different
    document, and each row represents the individual terms of the
    documents. For example, with N=4, M=3, and documents D1="a b c", D2="b c d",
    D3="a c", the matrix would be:

    |   | D1 | D2 | D3 |
    |---+----+----+----|
    | a |  1 |  0 |  1 |
    | b |  1 |  1 |  0 |
    | c |  1 |  1 |  1 |
    | d |  0 |  1 |  0 |

    The function then runs NMF on the above matrix, and generates two
    matrices, U (Nxk) and V (Mxk), which approximate X with
    U.dot(V.T).

    For each ith row of V (0 < i < M),

    Then we assign the ith document (approximated by the ith row of V)
    to cluster x, where x is the maximum feature of the ith row of V
    (this implies that 0 <= x < k). Put another way, document_i is
    assigned to cluster x, where x = argmax(V[i]).

    The return value of this function is an array, where the ith
    element is a number representing the cluster document i was
    assigned.

    ----

    With weather data, each column is a different day/time, and each
    row represents a different zipcode. In the end, it will cluster
    days/times together.

    ----

    Based on:

    Xu, W., Liu, X., & Gong, Y. (2003, July). Document clustering
    based on non-negative matrix factorization. In Proceedings of the
    26th annual international ACM SIGIR conference on Research and
    development in informaion retrieval (pp. 267-273). ACM.

    """
    if (X is None or k is None) and (U is None or V is None):
        raise ValueError("Either (X and k) or (U and V) must be passed")

    if U is None and V is None:
        # Obtain the U and V matrices.
        nmf = sklearn.decomposition.NMF(k)

        U = nmf.fit_transform(X)
        V = nmf.components_.T

    # Get unit L1 norm for each column of U
    norms = np.linalg.norm(U, axis=0)[None, :]
    V *= norms
    U /= norms

    # Assign clusters
    clusters = [np.argmax(V[i]) for i in range(len(V))]

    return clusters

def main():
    if len(sys.argv) < 3:
        print "Usage: %s input.mat output.mat" % sys.argv[0]
        exit(1)

    input_filename = sys.argv[1]
    output_filename = sys.argv[2]

    matrices = scipy.io.loadmat(input_filename)

    results = dict()
    for k in matrices["features"][0]:
        W = matrices["W%d" % k]
        H = matrices["H%d" % k]

        clusters = cluster(U=W, V=H.T)

        results["cluster%d" % k] = clusters

        print "Clusters for k=%d" % k
        for v, count in collections.Counter(clusters).most_common():
            print "%3d: %3d/%3d (%0.3f%%)" % (v, count, len(clusters),
                                              count / len(clusters))
        print

    scipy.io.savemat(output_filename, results)

if __name__ == "__main__":
    main()
