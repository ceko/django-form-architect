dfb.widgets.PhoneNumber = dfb.widgets.WidgetBase.extend({
	init: function(options) {		
		this.settings = $.extend({}, {
			label : 'Ring me up',
			context_menu_template_selector : '#phonenumber-context-menu-template',
			child_type : 'dfb.widgets.PhoneNumber',
			mask : '(999)-999-9999',
			configurables: [
				'type',
				'label',
				'required',
				'help_text',				
				'default',
				'mask'
			]
		}, options);		
		this._super(this.settings);
	},

	cmh_wireUpMask: function($context_menu) {
		var _this = this;
		var $input = this.getElement().find('.jq-input');
		var $mask =	$context_menu.find('.jq-mask');
		
		$mask.val([this.settings.mask]);
		
		var setMask = function() {
			var $this = $mask;
			var $default_textbox = $context_menu.find('.jq-default');
			
			var selected_mask = $this.find('option:selected').val();
			$input.data('mask', selected_mask);
			if(selected_mask) {
				$default_textbox.mask(selected_mask);
			}else{
				$default_textbox.unmask();
			}
			$default_textbox.trigger('keyup');
		}
		$context_menu.find('.jq-mask')		
			.bind('change', setMask);
		setMask();
	},
	
	cmh_exportMask: function() {
		return this.getElement().find('.jq-input').data().mask;
	},
});