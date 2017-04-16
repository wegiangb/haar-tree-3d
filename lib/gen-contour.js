var ch = require('convex-hull')

console.log(`// THIS FILE IS GENERATED. DO NOT MODIFY
var search = require('./lib/btree.js').search

function Crossing (opp, idx) {
  this.opp = opp
  this.idx = idx
}

function findCrossing (positions, s, lox, loy, loz, a, b) {
  var adj = a.adj
  for (var i = 0; i < adj.length; ++i) {
    if (adj[i].opp === b) {
      return adj[i].idx
    }
  }

  // Add crossing record
  var idx = positions.length
  a.adj.push(new Crossing(b, idx))
  b.adj.push(new Crossing(a, idx))

  // compute crossing
  var aw = a.w
  var bw = b.w

  var t = -bw / (aw - bw)
  var ti = 1 - t

  positions.push([
    (ti * b.x + t * a.x) * s + lox,
    (ti * b.y + t * a.y) * s + loy,
    (ti * b.z + t * a.z) * s + loz
  ])

  return idx
}

function emitPyramidFaces (positions, cells, s, lox, loy, loz, a, c00, c01, c10, c11) {
  var e0, e1, e2, e3, e4, e5
  var wa = a.w < 0
  var w00 = c00.w < 0
  var w01 = c01.w < 0
  var w10 = c10.w < 0
  var w11 = c11.w < 0
  var mask = wa | (w00 << 1) | (w01 << 2) | (w10 << 3) | (w11 << 4)
  switch (mask) {
${(function () {
  var points = [
    [0, 0, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [-1, 1, 1],
    [1, 1, 1]
  ]

  var edges = [
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4]
  ]

  var edgePoints = edges.map(function (e) {
    var a = points[e[0]]
    var b = points[e[1]]
    var y = [0, 0, 0]
    for (var i = 0; i < 3; ++i) {
      y[i] = 0.5 * (a[i] + b[i])
    }
    return y
  })

  var ftable = []
  var etable = []

  var edgeOffset = new Array(edges.length)
  for (var i = 0; i < (1 << points.length); ++i) {
    var pp = []
    for (var j = 0; j < points.length; ++j) {
      if (i & (1 << j)) {
        pp.push(points[j])
      }
    }
    var shift = pp.length
    var emask = 0
    for (var k = 0; k < edges.length; ++k) {
      var a = edges[k][0]
      var b = edges[k][1]
      if (((i >> a) ^ (i >> b)) & 1) {
        edgeOffset[k] = pp.length - shift
        pp.push(edgePoints[k])
        emask |= (1 << k)
      } else {
        edgeOffset[k] = -1
      }
    }
    var bnd = ch(pp)
    var faces = []
    bnd.forEach(function (cell) {
      var recell = cell.slice()
      for (var i = 0; i < cell.length; ++i) {
        var p = pp[cell[i]]
        if (points.indexOf(p) >= 0) {
          return
        }
        var ei = edgePoints.indexOf(p)
        if (ei < 0) {
          throw new Error('something is terribly broken')
        }
        var xc = edgeOffset[ei]
        if (xc < 0) {
          throw new Error('this should not happen')
        }
        recell[i] = xc
      }
      faces.push(recell)
    })
    etable[i] = emask
    ftable[i] = faces
  }

  var result = []
  var labels = [
    'a',
    'c00',
    'c01',
    'c10',
    'c11'
  ]

  for (i = 0; i < etable.length; ++i) {
    result.push(`    case ${i}:`)

    emask = etable[i]
    var count = 0
    for (j = 0; j < edges.length; ++j) {
      var e = edges[j]
      if (emask & (1 << j)) {
        result.push(`      e${count++} = findCrossing(positions, s, lox, loy, loz, ${labels[e[0]]}, ${labels[e[1]]})`)
      }
    }

    faces = ftable[i]
    for (k = 0; k < faces.length; ++k) {
      var f = faces[k]
      result.push(`      cells.push([e${f[0]}, e${f[1]}, e${f[2]}])`)
    }

    result.push('    break;')
  }

  return result.join('\n')
})()}
  }
}

function Corner (x, y, z, l) {
  this.x = x
  this.y = y
  this.z = z
  this.w = 0
  this.l = l
  this.adj = null
}

function findCorner (corners, x, y, z) {
  var lo = 0
  var hi = corners.length - 1
  while (lo < hi) {
    var mid = (lo + hi) >> 1
    var c = corners[mid]
    var d = (c.x - x) || (c.y - y) || (c.z - z)
    if (d > 0) {
      hi = mid - 1
    } else if (d < 0) {
      lo = mid + 1
    } else {
      return c
    }
  }
  var cc = corners[lo]
  if (cc.x === x && cc.y === y && cc.z === z) {
    return cc
  }
  return null
}

function genSteiner (a, b, c, d) {
  var r = new Corner(
    (a.x + b.x + c.x + d.x) >> 2,
    (a.y + b.y + c.y + d.y) >> 2,
    (a.z + b.z + c.z + d.z) >> 2,
    Math.max(a.l, b.l, c.l, d.l))
  r.w = (a.w + b.w + c.w + d.w) / 4
  r.adj = []
  return r
}

function emitTetFaces (positions, cells, s, lox, loy, loz, a, b, c, d) {
  var e0, e1, e2, e3
  var aw = a.w < 0
  var bw = b.w < 0
  var cw = c.w < 0
  var dw = d.w < 0
  var mask = aw | (bw << 1) | (cw << 2) | (dw << 3)
  switch (mask) {
${(function () {
  var points = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]

  var edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3]
  ]

  var edgePoints = edges.map(function (e) {
    var a = points[e[0]]
    var b = points[e[1]]
    var y = [0, 0, 0]
    for (var i = 0; i < 3; ++i) {
      y[i] = 0.5 * (a[i] + b[i])
    }
    return y
  })

  var ftable = []
  var etable = []

  var edgeOffset = new Array(edges.length)
  for (var i = 0; i < (1 << points.length); ++i) {
    var pp = []
    for (var j = 0; j < points.length; ++j) {
      if (i & (1 << j)) {
        pp.push(points[j])
      }
    }
    var shift = pp.length
    var emask = 0
    for (var k = 0; k < edges.length; ++k) {
      var a = edges[k][0]
      var b = edges[k][1]
      if (((i >> a) ^ (i >> b)) & 1) {
        edgeOffset[k] = pp.length - shift
        pp.push(edgePoints[k])
        emask |= (1 << k)
      } else {
        edgeOffset[k] = -1
      }
    }
    var bnd = ch(pp)
    var faces = []
    bnd.forEach(function (cell) {
      var recell = cell.slice()
      for (var i = 0; i < cell.length; ++i) {
        var p = pp[cell[i]]
        if (points.indexOf(p) >= 0) {
          return
        }
        var ei = edgePoints.indexOf(p)
        if (ei < 0) {
          throw new Error('something is terribly broken')
        }
        var xc = edgeOffset[ei]
        if (xc < 0) {
          throw new Error('this should not happen')
        }
        recell[i] = xc
      }
      faces.push(recell)
    })
    etable[i] = emask
    ftable[i] = faces
  }

  var result = []
  var labels = [ 'a', 'b', 'c', 'd' ]

  for (i = 0; i < etable.length; ++i) {
    result.push(`    case ${i}:`)

    emask = etable[i]
    var count = 0
    for (j = 0; j < edges.length; ++j) {
      var e = edges[j]
      if (emask & (1 << j)) {
        result.push(`      e${count++} = findCrossing(positions, s, lox, loy, loz, ${labels[e[0]]}, ${labels[e[1]]})`)
      }
    }

    faces = ftable[i]
    for (k = 0; k < faces.length; ++k) {
      var f = faces[k]
      result.push(`      cells.push([e${f[0]}, e${f[1]}, e${f[2]}])`)
    }

    result.push('    break;')
  }

  return result.join('\n')
})()}
  }
}

function emitSteinerFaces (positions, cells, s, lox, loy, loz, corners, a, b, y, c0, c1, dx, dy, dz) {
  var v = c0
  while (v !== c1) {
    var r = 1 << (30 - v.l)
    var u = null
    while (!u) {
      u = findCorner(corners, v.x + r * dx, v.y + r * dy, v.z + r * dz)
      r <<= 1
    }
    emitTetFaces(positions, cells, s, lox, loy, loz, a, y, u, v)
    emitTetFaces(positions, cells, s, lox, loy, loz, y, b, v, u)
    v = u
  }
}

function emitTopology (index, corners, cellCorners) {
  var tree = index.tree

  var bounds = index.bounds
  var lo = bounds[0]
  var hi = bounds[1]

  var lox = lo[0]
  var loy = lo[1]
  var loz = lo[2]
  var s = (hi[0] - lox) / (1 << 30)

  var positions = []
  var cells = []

  var octreeCells = tree.cells
  for (var i = 0; i < octreeCells.length; ++i) {
    var cc = cellCorners[i]
    var c = octreeCells[i]

    var x = c.x
    var y = c.y
    var z = c.z
    var l = c.l
    var r = 1 << (30 - l)

    var nidx, ncell, ncorner, steiner

${(function () {
  var result = []

  var LAZY_CORNER = {}
  var offset = [
    '',
    ' + r'
  ]
  for (var dz = 0; dz < 2; ++dz) {
    for (var dy = 0; dy < 2; ++dy) {
      for (var dx = 0; dx < 2; ++dx) {
        var cvar = 'c' + dx + dy + dz
        result.push(`    var ${cvar} = null`)
        LAZY_CORNER[cvar] = `${cvar} = ${cvar} || findCorner(corners, x${offset[dx]}, y${offset[dy]}, z${offset[dz]})`
      }
    }
  }

  emitFaceCheck(0, 0, 'c000', 'c010', 'c001', 'c011')
  emitFaceCheck(0, 1, 'c100', 'c101', 'c110', 'c111')

  emitFaceCheck(1, 0, 'c000', 'c001', 'c100', 'c101')
  emitFaceCheck(1, 1, 'c010', 'c110', 'c011', 'c111')

  emitFaceCheck(2, 0, 'c000', 'c100', 'c010', 'c110')
  emitFaceCheck(2, 1, 'c001', 'c011', 'c101', 'c111')

  return result.join('\n')

  function emitFaceCheck (d, s, c00, c01, c10, c11) {
    var offset = ['x', 'y', 'z']
    if (s <= 0) {
      offset[d] += ' - 1'
    } else {
      offset[d] += ' + r'
    }

    var du = [0, 0, 0]
    var dv = [0, 0, 0]
    du[(d + (s <= 0 ? 1 : 2)) % 3] = 1
    dv[(d + (s <= 0 ? 2 : 1)) % 3] = 1

    result.push(`
    nidx = search(tree, ${offset.join(', ')})
    ncell = octreeCells[nidx]
    if (ncell.l ${s <= 0 ? '<= l && nidx !== i' : '< l'}) {
      ${LAZY_CORNER[c00]}
      ${LAZY_CORNER[c01]}
      ${LAZY_CORNER[c10]}
      ${LAZY_CORNER[c11]}
      if (${c00}.l === l && ${c01}.l === l && ${c10}.l === l && ${c11}.l === l) {
        emitPyramidFaces(positions, cells, s, lox, loy, loz, cc, ${c00}, ${c01}, ${c10}, ${c11})
        emitPyramidFaces(positions, cells, s, lox, loy, loz, cellCorners[nidx], ${c00}, ${c10}, ${c01}, ${c11})
      } else {
        steiner = genSteiner(${c00}, ${c01}, ${c10}, ${c11})
        ncorner = cellCorners[nidx]
        emitSteinerFaces(positions, cells, s, lox, loy, loz, corners, cc, ncorner, steiner, ${c00}, ${c01}, ${du[0]}, ${du[1]}, ${du[2]})
        emitSteinerFaces(positions, cells, s, lox, loy, loz, corners, cc, ncorner, steiner, ${c01}, ${c11}, ${dv[0]}, ${dv[1]}, ${dv[2]})
        emitSteinerFaces(positions, cells, s, lox, loy, loz, corners, cc, ncorner, steiner, ${c11}, ${c10}, ${-du[0]}, ${-du[1]}, ${-du[2]})
        emitSteinerFaces(positions, cells, s, lox, loy, loz, corners, cc, ncorner, steiner, ${c10}, ${c00}, ${-dv[0]}, ${-dv[1]}, ${-dv[2]})
      }
    }`)
  }
})()}
  }

  return {
    positions: positions,
    cells: cells
  }
}

function sampleNeighbor (tree, x, y, z) {
  var w = 0
  for (var dx = 0; dx < 2; ++dx) {
    for (var dy = 0; dy < 2; ++dy) {
      for (var dz = 0; dz < 2; ++dz) {
        w += tree.cells[search(tree, x - dx, y - dy, z - dz)].w
      }
    }
  }
  return w / 8
}

function compareCorners (a, b) {
  return (a.x - b.x) || (a.y - b.y) || (a.z - b.z)
}

function isoval (v, l) {
  return Math.log(Math.max(v / Math.min(1 - v, 0.9999), 0.001))
}

module.exports = function contourHaar (index, level_) {
  var level = (typeof level_ === 'number') ? +level_ : 0.5
  var i

  var tree = index.tree
  var octreeCells = tree.cells

  // 1st pass: generate corners and faces
  var cptr = 0
  var corners = new Array(octreeCells.length * 8)
  var cellCorners = new Array(octreeCells.length)
  for (i = 0; i < octreeCells.length; ++i) {
    var c = octreeCells[i]

    var x = c.x
    var y = c.y
    var z = c.z
    var l = c.l
    var r = 1 << (30 - l)

    ${(function () {
      var result = []
      var tab = ['', ' + r']
      for (var dz = 0; dz < 2; ++dz) {
        for (var dy = 0; dy < 2; ++dy) {
          for (var dx = 0; dx < 2; ++dx) {
            result.push(`corners[cptr++] = new Corner(x${tab[dx]}, y${tab[dy]}, z${tab[dz]}, l)`)
          }
        }
      }
      return result.join('\n    ')
    })()}

    var cc = new Corner(x + (r >> 1), y + (r >> 1), z + (r >> 1), l)
    cc.w = isoval(c.w, level)
    cc.adj = []
    cellCorners[i] = cc
  }

  // 2nd pass: sort corners
  corners.sort(compareCorners)

  // 3rd pass: compute weights for each corner
  var ptr = 0
  for (i = 0; i < corners.length; ++i) {
    var lmax = corners[i].l
    while (i + 1 < corners.length &&
      compareCorners(corners[i], corners[i + 1]) === 0) {
      lmax = Math.max(lmax, corners[++i].l)
    }
    var corner = corners[i]
    corners[ptr++] = corner
    corner.l = lmax
    corner.w = isoval(sampleNeighbor(tree, corner.x, corner.y, corner.z), level)
    corner.adj = []
  }
  corners.length = ptr

  window.OCTREE_CORNERS = corners.concat(cellCorners)

  // final pass: emit topology
  return emitTopology(index, corners, cellCorners)
}
`)