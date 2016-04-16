/**
 * Created by alemjc on 4/9/16.
 */

exports.binarySearch = function(items, id){

  console.log("in binary search");
  console.log(id);
  console.log("-------------------------");
  var start = 0;
  var end = items.length;

  while(start<end){

    var mid = Math.floor((start+end)/2);

    console.log(items[mid].id);
    if(items[mid].id.localeCompare(id) === 0){
      return items[mid];
    }
    else if(items[mid].id.localeCompare(id) < 0){
      start = mid+1;
    }
    else{
      end = mid-1;
    }


  }

  return undefined;

};