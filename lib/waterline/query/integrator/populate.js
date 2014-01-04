/**
 * Module dependencies
 */
var _ = require('lodash');



/**
 * populate()
 *
 * Destructive mapping of `parentRows` to include a new key, `alias`,
 * which is an ordered array of child rows.
 *
 * @option [{Object}] parentRows    - the parent rows the joined rows will be folded into
 * @option {String} alias           - the alias of the association
 * @option [{Object}] childRows     - the unfolded result set from the joins
 *
 * @option {String} parentPK        - the primary key of the parent table (optional- only needed for M..N associations)
 * @option {String} fkToChild       - the foreign key associating a row with the child table
 * @option {String} childPK         - the primary key of the child table
 *
 * @option [{String}] select        - attributes to keep
 *
 * @return {*Object} reference to `parentRows`
 */
module.exports = function populate (options) {

  var parentRows = options.parentRows;
  var alias = options.alias;
  var childRows = options.childRows;

  var parentPK = options.parentPK;
  var childPK = options.childPK;
  var fkToChild = options.fkToChild;
  var fkToParent = parentPK;// At least for all use cases currently, `fkToParent` <=> `parentPK`

  var select = options.select;

  return _.map(parentRows, function _insertJoinedResults (parentRow) {


    // Gather the subset of child rows associated with the current parent row
    var associatedChildRows = _.where(childRows,
      //{ (parentPK): (parentRow[(parentPK)]) }, e.g. { id: 3 }
      _cons(fkToParent, parentRow[parentPK])
    );

    // Stuff the sanitized associated child rows into the parent row.
    parentRow[alias] =
    _.reduce(associatedChildRows, function (memo, childRow) {

      // Ignore join rows without an appropriate foreign key
      // to an instance in the REAL child collection.
      if (!childRow[fkToChild]) return memo;

      // Rename childRow's [fkToChild] key to [childPK]
      // (so that it will have the proper primary key attribute for its collection)
      var childPKValue = childRow[fkToChild];
      delete childRow[fkToChild];
      childRow[childPK] = childPKValue;

      // If specified, pick a subset of attributes from child row
      if (select) {
        childRow = _.pick(childRow, select);
      }

      // Build the set of rows to stuff into our parent row.
      memo.push(childRow);
      return memo;
    }, []);

    return parentRow;
  });
};




/**
 * Dumb little helper because I hate naming anonymous objects just to use them once.
 *
 * @return {Object} [a tuple]
 * @api private
 */
function _cons(key, value) {
  var obj = {};
  obj[key] = value;
  return obj;
}



