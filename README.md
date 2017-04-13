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
		{id:id ,text:text}
		proccessData: function(data){

		    //return the data
		   return data.db_data_array;
		}//end proccess ajax data

	}//end auto complete 
   });
   
});
```
