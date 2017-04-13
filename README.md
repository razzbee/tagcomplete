# tagcomplete
Tag + AutoComplete = Tagcomplete is a jquery library for tagging and autocomplete,it also supports ajax and manual data

##Instruction:
###Include the scripts into your page

```html
<link rel='stylesheet' href='/path/to/tagcomplete.material.css' />

<script src='/path/to/jquery.js'></script>
<script src='/path/to/ttagcomplete.js'></script>
```

```javascript

<script>
$(function(){

 $(".tags_input").tagComplete({
	
	autocomplete:{
					
          //manual data , it will work together with ajax set
          data: ['email1@example.com','email2@example.com','email3@example.com'],
          
          ajaxOpts:{
						
		url: '{{url("contacts/email-search")}}',
		},

		//ajax query param
		params: function(value){
						
			return {q:value};
		},

		//proccess data after ajax is complete and send it back to plugin
		//the data must be an object in the form 
		//{id:id ,text:text}
		proccessData: function(data){

		    //return the data
		   return data.db_data_array;
		}//end proccess ajax data

	}//end auto complete 
   });
   
});
```

##Default Options
```javascript
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

				//proccess data for ajax only
				//after ajax proccess data 
				//and return the proccessed data
				//this method is called in the onSuccess
				//ajax event
				//also data returned must be in the form
				//of {id: key ,text: 'some text'}
				proccessData: function(data){
					return data;
				},

			}//end auto complete

		};
```		
