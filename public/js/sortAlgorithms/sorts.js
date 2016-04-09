/**
 * Created by alemjc on 4/9/16.
 */


var merge = function(arr1, arr2){
  var arr3 = [];
  var arr1Counter = 0;
  var arr2Counter = 0;

  while(arr1Counter < arr1.length || arr2Counter < arr2.length){

    if(arr1Counter < arr1.length && arr2Counter < arr2.length){

      if(arr1[arr1Counter].id.localeCompare(arr2[arr2Counter].id) < 0){
        arr3.push(arr1[arr1Counter]);
        arr1Counter++;
      }
      else{
        arr3.push(arr2[arr2Counter]);
        arr2Counter++;
      }

    }
    else if(arr1Counter < arr1.length){
      arr3.push(arr1[arr1Counter]);
      arr1Counter++;
    }
    else if(arr2Counter < arr2.length){
      arr3.push(arr2[arr2Counter]);
      arr2Counter++;
    }

  }

  return arr3;
};

var mergeSortHelper = function(items, start, end){

  if(start === end){
    var arr = [];
    arr.push(items[start]);
    return arr;
  }

  var mid = Math.floor((start+end)/2);
  var arr1 = mergeSortHelper(items, start, mid-1);
  var arr2 = mergeSortHelper(items, mid+1, end);

  return merge(arr1, arr2);

};

exports.mergeSort = function(items){
  return mergeSortHelper(items,0,items.length);
};