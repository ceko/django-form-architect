dfb.widgets.DropDown = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Select an option',			
			context_menu_template_selector : '#dropdown-context-menu-template',
			child_type : 'dfb.widgets.DropDown',
			size : 'm',
			options : [
			    {text: '', selected: true},
				{text: 'option 1', selected: false},
				{text: 'option 2', selected: false},
				{text: 'option 3', selected: false}
			],
			configurables: [
				'type',
				'label',
				'required',
				'help_text',
				'size',		
				'options',
			]
		}, options);		
		this._super(this.settings);
	},
	cmh_wireUpOptions: function($context_menu) {		
		var _this = this;
		var $input = this.getElement().find('.jq-input');
		$context_menu.find('.jq-dropdown-options')
			.contextmenuoptions({
				on_remove : function(index) {					
					$input.find('option').eq(index).remove();
				},
				on_add : function() {
					$input.append('<option></option>');
				},
				on_index_change : function(index) {					
					$input.find('option').eq(index).prop('selected', true);
				},		
				on_text_change : function(index, text) {					
					$input.find('option').eq(index)
						.val(text)
						.text(text);
				}
			}); /*should be configurable selector...*/				
	},
	cmh_exportOptions: function() {
		var options = [];
		$(this.getElement().find('.jq-input option')).each(function() {			
			options.push({
				text : $(this).val(),
				selected : $(this).is(':selected')
			});
		});
		return options;
	}
});