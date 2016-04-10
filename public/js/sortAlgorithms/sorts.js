/**
 * Created by alemjc on 4/9/16.
 */


var merge = function(arr1, arr2){
  var arr3 = [];
  var arr1Counter = 0;
  var arr2Counter = 0;

  console.log("arr1.length: ",arr1.length);
  console.log("arr2.length: ",arr2.length);

  while(arr1Counter < arr1.length || arr2Counter < arr2.length){

    if(arr1Counter < arr1.length && arr2Counter < arr2.length){

      if(arr1[arr1Counter].id.localeCompare(arr2[arr2Counter].id) < 0){
        //console.log("comparison is: ",arr1[arr1Counter].id.localeCompare(arr2[arr2Counter].id));
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

  console.log("arr1Counter %d ==? arr1.length %d", arr1Counter,arr1.length);
  console.log("arr2Counter %d ==? arr2.length %d", arr2Counter,arr2.length);

  return arr3;
};

var mergeSortHelper = function(items, start, end){

  if((end - start)<2){
    //console.log("!!!!!!!!!!!!!!!!! reached base case !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    var arr = [];
    console.log(start);
    arr.push(items[start]);
    return arr;
  }

  var mid = Math.floor((start+end)/2);
  var arr1 = mergeSortHelper(items, start, mid);
  var arr2 = mergeSortHelper(items, mid, end);

  return merge(arr1, arr2);

};

exports.mergeSort = function(items){
  return mergeSortHelper(items,0,items.length);
};
