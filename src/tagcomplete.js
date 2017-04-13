/**
*APACHE 2.0 LICENSE
*@author: Razak Zakari <razzsense@gmail.com>
 */
(function( $ ){

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

	//delete tag
	$.fn.deleteTag = function(selector){
		
		//remove tag
		$(selector).remove();
	};//end delete tag 

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


	//tag Complete
	/**Main Plugin Func **/
	$.fn.tagComplete = function(userOpts){


		var defaultOpts = {
			
			//keylimit,input limit
			keylimit: 1,
			
			//tokenizer
			tokenizer: ",",

			//free input,all free input of data
			//which is not included in the autocomplet
			//or suggested
			freeinput : true,

			//autocomplete
			autocomplete: {

				//none ajax or local data
				//for auto complete
				data:[],

				//ajax options for 
				//the autocomplete
				//uses jquery ajax options
				ajaxOpts: {
					//url: "",
					method: 'GET',
					dataType: 'json',
					data: {}
				},

				//parameter setting for the
				//ajax request
				params : function(value){
					return {q: value,lol: 23};
				},

				//proccess data after the ajax has returned
				//the data from server 
				//and return the proccessed data
				//this method is called in the onSuccess
				//ajax event
				//also data returned must be in the form
				//of {id:text}
				//where id is any unique id of the text
				proccessData: function(data){
					return data;
				},

			}//end auto complete

		};

		//set default options
		var options = $.extend(true,defaultOpts,userOpts); 
		
		//console.log(options);

		//proccess plugin
		return this.each(function(){

			self = $(this);

			//lets get the input
			userInput = $(this);

			//hide the input 
			userInput.addClass('hide');

			//main container
			var tagCompleteMain = $("<div class='tag_complete_main'></div>");

			//tag complete input container
			var tagComplete = $("<div class='tag_complete'></div>");

			//add tagComplete container to main container
			tagCompleteMain.append(tagComplete);

			var autoComplete = $("<ul class='autocomplete hide'></ul>");

			//insert after auto complete
			tagCompleteMain.append(autoComplete);

			//append the tag Container
			tagComplete.append("<div class='tags_container'></div>");

			tagsContainer = tagComplete.find('.tags_container');

			//insert the tagCompleteMain right after the
			//user input tag
			tagCompleteMain.insertAfter(userInput);

			//taginput
			tagInput = $("<input type='text' class='tag_input' />");

			//append the tag input to the tag_complete
			tagComplete.append(tagInput);

			//focus input if the tags_container is clicked
			tagComplete.on('click',function(){
				tagInput.focus();
			});//end if

			//tag Input on focus , focus tagComplete
			//container
			tagInput.on("focus",function(){
				tagComplete.addClass("is_focused");
			}).on("blur",function(){
				tagComplete.removeClass("is_focused");
			});//end tagComplete focus styling

			//if the tag close button is clicked
			tagsContainer.on("click",".tag .close",function(e){
				
				$(this).parent(".tag").remove();

				//refresh User Input 
				$.fn.refreshUserInput(userInput,tagsContainer,options);
			});//end onTag Close 

			//if the auto complete child ,li is clicked 
			//,then we 
			//add tag 
			autoComplete.on('click','li',function(e){

				//prevent default
				e.preventDefault();

				//id
				var id = $(this).data('id');

				//add tag 
				$.fn.addTag(tagsContainer,id,$(this).text());

				//refresh User input
				$.fn.refreshUserInput(userInput,tagsContainer,options);

				//empty value 
				tagInput.val("");

				//stop ajax requests 
				$.fn.abortAjax(ajaxPool);

				//clear autocomplete 
				$.fn.clearAutoComplete(autoComplete);
			});//end if the autocomplete list is clicked 


			//ajax pool
			ajaxPool = []; 

			//lets listen if enter key is pressed and not empty
			tagInput.on("keyup",function(e){

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
					tagInput.val(lastTagInfo.text);

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
						});

						//register ajax reqest 
						//so that can be cancelled if user selected any
						ajaxPool.push(ajaxReq);
					}//end if the url is provided 

			});//end onkeyup ...

		});//end on each loop 
	

	};//end jq module name 

}( jQuery ));