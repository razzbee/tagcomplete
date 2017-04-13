/**
*APACHE 2.0 LICENSE
*@author: Razak Zakari <razzsense@gmail.com>
 */
(function( $ ){

	/**
	 * [tagComplete Tag+AutoComplete]
	 * @param  {[object]} userOpts [user options object]
	 * @return {[object]}          [plugin instances]
	 */
	$.fn.tagComplete = function(userOpts){

		var defaultOpts = {
			
			//keylimit
			keylimit: 1,
			
			//tokenizer
			tokenizer: ",",

			//free input
			freeinput : true,

			//autocomplete
			autocomplete: {

				ajaxOpts: {
					method: 'GET',
					dataType: 'json',
					data: {}
				},

				//param,ajax only
				params : function(value){
					return {q: value,lol: 23};
				},

				//proccess data for ajax only
				proccessData: function(data){
					return data;
				},

				//data
				data:[]
			}//end auto complete

		};//end default objects 


		//set default options
		var options = $.extend(true,defaultOpts,userOpts); 
		
		//console.log(options);

		//proccess plugin
		return this.each(function(){

			//set ajax pool to contain all requests 
			ajaxPool = [];

			//lets get the input
			userInput = self = $(this);

			//hide the input 
			userInput.addClass('hide');

			//main container
			tagCompleteMain = $("<div class='tag_complete_main'>"+
									"<div class='tag_complete'>"+
									"<div class='tags_container'></div>"+
									"<input type='text' class='tag_input' />"+
									"</div>"+
									"<ul class='autocomplete hide'></ul>"+
									"</div>"
								);

			//insert the tagCompleteMain right after the
			//user input tag
			tagCompleteMain.insertAfter(userInput);

			//tagComplete
			tagComplete = tagCompleteMain.find(".tag_complete");

			//tag Input
			tagInput = tagComplete.find(".tag_input");

			//tags container 
			tagsContainer = tagComplete.find(".tags_container");

			//auto complete 
			autoComplete = tagCompleteMain.find(".autocomplete");

			//domSelectors
			//register the dom and instance 
			instanceData = {
				userInput : userInput,
				tagCompleteMain: tagCompleteMain,
				tagComplete: tagComplete,
				tagsContainer: tagsContainer,
				tagInput: tagInput,
				autoComplete: autoComplete,
				options: options,
				ajaxPool: ajaxPool
			};//end dom obj


			//focus input if the tags_container is clicked
			tagComplete.on('click',instanceData,function(e){
				//focus the tagInput
				e.data.tagInput.focus();
			});//end if

			//tag Input on focus , focus tagComplete
			//container
			tagInput.on("focus",instanceData,function(e){
				e.data.tagComplete.addClass("is_focused");
			})
			.on("blur",instanceData,function(e){
				e.data.tagComplete.removeClass("is_focused");
			});//end tagComplete focus styling


			//if the auto complete child ,li is clicked 
			//,then we 
			//add tag 
			autoComplete.on('click','li',instanceData,function(e){

				//instance
				inst = e.data;

				//console.log(inst);

				//id
				var id = $(this).data('id');

				//add tag 
				$.fn.addTag(inst.tagsContainer,id,$(this).text());

				//refresh User input
				$.fn.refreshUserInput(inst.userInput,inst.tagsContainer,inst.options);

				//empty value 
				tagInput.val("");

				//stop ajax requests 
				$.fn.abortAjax(ajaxPool);

				//clear autocomplete 
				$.fn.clearAutoComplete(inst.autoComplete);
			});//end onclick 

			//if the tag close button is clicked
			tagsContainer.on("click",".tag .close",instanceData,function(e){
				
				//instance data
				inst = e.data;

				$(this).parent(".tag").remove();

				//refresh User Input 
				$.fn.refreshUserInput(inst.userInput,inst.tagsContainer,inst.options);
			});//end onTag Close 


			//lets listen if enter key is pressed and not empty
			tagInput.on("keyup",instanceData,function(e){

				//instance data 
				instData = e.data;

				//deflate the instance data 
				tagCompleteMain = instData.tagCompleteMain;
				tagComplete = instData.tagComplete;
				tagsContainer = instData.tagsContainer;
				tagInput = instData.tagInput;
				autoComplete = instData.autoComplete;
				options = instData.options;
				ajaxPool = instData.ajaxPool;

				value = $(this).val();

				//console.log(value);

				keycode = (e.keyCode ? e.keyCode : e.which);

				//if the value is empty , set auto complete to 0
				if(value.length == 0){
					$.fn.clearAutoComplete(autoComplete);
				}//end 
                
				//if value is empty and the backspace is pressed
				//lets delete last input and also populate 
				//the input with it
				if(value.length == 0 && keycode == 8){

					//get lastTag
					lastTagNo = tagsContainer.find('.tag').length;

					//if empty abort
					if(lastTagNo == 0){
						return false;
					}//end if 

					lastTagInfo = $.fn.getTagInfo(tagsContainer,lastTagNo);

					//remove the tag
					lastTagInfo.selector.remove();

					//console.log(lastTagInfo.text);

					//update the tags input text to the deleted 
					//also this will help move the cursor to the end
					tagInput.focus().val('').val(lastTagInfo.text);

					//refresh User input
					$.fn.refreshUserInput(userInput,tagsContainer,options);

					//stop exec
					return self;
				}//end if the key is back key 


				//check if enter is pressed && 
				//tag is not empty then add tag
				//if the key too is tokenizer set
				//create tag
				else if((keycode == 13 || e.key == options.tokenizer)
						&& value.length > 0
						 && options.freeinput == true){

					//trim last tokenizer 
					value = value.slice(0,value.lastIndexOf(options.tokenizer));

					//add tag 
					$.fn.addTag(tagsContainer,value,value);

					//empty value 
					$(this).val("");

					//stop ajax requests 
					$.fn.abortAjax(ajaxPool);

					//clear autocomplete 
					$.fn.clearAutoComplete(autoComplete);

					//refresh User input
					$.fn.refreshUserInput(userInput,tagsContainer,options);


					return self;
				}//end if enter is pressed 
					

				//user provided autocomplete data
				autoCompeleteData = options.autocomplete.data;

				//matched contents
				matchedData = {};

				//if freeinput is enabled
				if(options.freeinput == true){
					//always the first data will be the value 
					matchedData[value] = value;
				}//end if

				//if we are here, then mean auto complete
				//url or local source is set 
				//if value limit is less than keyslimit,then
				//abort
				if(value.length < options.keylimit){
					return self;
				}//end if value length is less than keyslimit

				//if data is available
				if(typeof options.autocomplete.data == 'object'){

					//loop the data to get keywords 
					for(i=0;i<autoCompeleteData.length;i++){

						dataWord = autoCompeleteData[i];

						//if we dont have a match
						if(dataWord.indexOf(value) == -1){
							continue;
						}//end if

						//add to matched dropdown Data
						//using the word as key prevent 
						//duplicate values
						matchedData[dataWord] = dataWord;

						}//end for loop 

						//upldate the drop down first
						//before the network request
						$.fn.updateAutoComplete(autoComplete,matchedData);
					}//end if options.data an array or obj 

					//dataUrl
					dataUrl = options.autocomplete.ajaxOpts.url;

					//now if we have url set 
					if(dataUrl != null){

						ajaxOpts = options.autocomplete.ajaxOpts;
						
						params = options.autocomplete.params.call(null,value);

						//set ajax data 
						ajaxOpts.data = $.extend(options.data,params);

						//console.log(ajaxOpts.data);

						ajaxReq = $.ajax(ajaxOpts)
							.success(function(data){

							//proccess data
							proccessedData = options.autocomplete.proccessData.call(null,data);

							//if empty we will abort
							if(proccessedData.length==0){
								return false;
							}//end if 

							//add to the local data
							$.extend(matchedData,proccessedData);

							//update auto complete 
							$.fn.updateAutoComplete(autoComplete,matchedData);
						});//end ajaxReq

			
					}//end if the url is provided 

			});//end onkeyup ...

		});//end on each loop 
	

	};//end jq module name 



	/**
	 * Module Functions 
	 */

	 	/**
	 * addTag
	 */
	$.fn.addTag = function(tagsContainer,tagId,tagText){

		closeTag = "<span class='close'></span>";

		tag = $("<span data-id='"+tagId+"' class='tag'>"+
				tagText+closeTag+
				"</span>");

		tagsContainer.append(tag);
	};//end add Tag

	//getTag
	$.fn.getTagInfo = function(tagsContainer,child){

		selector = ".tag:nth-child("+child+")";

		tagDom = tagsContainer.find(selector);

		tagText = tagDom.text();

		tagId = tagDom.data('id');

		tagInfo = {
			id: tagId,
			text: tagText,
			selector: tagDom
		}

		return tagInfo;
	}//end getTag


	//update AutoComplete
	$.fn.updateAutoComplete = function(
								autoCompleteDom,
								data){

		var listData = "";

		//lets loop the data 
		$.each(data,function(id,text){

			//build list
			listData += "<li data-id='"+id+"'>"+text+"</li>";
		});//end loop

		//add autocomplete item
		autoCompleteDom.empty().html(listData).removeClass('hide');

		autoCompleteDom.parent('.tag_complete_main')
						.find('.tag_complete')
						.addClass('has_autocomplete');
	};//end updateAutoComplete

	//clear autoComplete
	$.fn.clearAutoComplete = function(autoCompleteDom){

		autoCompleteDom.addClass('hide').empty();

		autoCompleteDom.parent('.tag_complete_main')
						.find('.tag_complete')
						.removeClass('has_autocomplete');
	}//end clear AutoComplete

	//abort ajaxRequest
	$.fn.abortAjax = function(ajaxPool){
		
		if(ajaxPool.length > 0){
			//stop all ajax pool
			$.each(ajaxPool,function(id,ajaxReq){
				ajaxReq.abort();
			});
		}//end if ajax pool isnt empty 

	};//end abort pool

	/**
	 * refreshUserInput
	 */
	 $.fn.refreshUserInput = function(
	 						userInput,
	 						tagsContainer,
	 						options
	 						){

	 	//get all the tags data , tokenize it
	 	tokenizer = options.tokenizer;

	 	tokenizedData = "";

	 	//get all tags 
	 	tags = tagsContainer.find(".tag");

	 	//if no tag, return false
	 	if(tags.length == 0){
	 		return false;
	 	}//end 

	 	//loop to get keys 
	 	$.each(tags,function(key,tagObj){

	 		//lets get the data id 
	 		tagData = $(this).data("id") || $(this).text();

	 		tokenizedData += tagData+",";
	 	});//end loop 

	 	//remove trailing ,
	 	tokenizedData = tokenizedData.slice(0,tokenizedData.lastIndexOf(","));

	 	//console.log(tokenizedData);
	 	userInput.val(tokenizedData);
	 };//end refresh userInput
	
	 /**
	  * End Module Functions 
	  */

}( jQuery ));