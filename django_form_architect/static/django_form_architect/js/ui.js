var dfb = dfb || {};

dfb.ui = {
	ui_id_cnt: 1,
	$waiter: null,
	$dialog_overlay: null,
	getUniqueID: function() {
		return this.ui_id_cnt++;
	},
	showWaiter: function() {
		if(!this.$waiter) {
			this.$waiter = $("<div class='ui-waiter'></div>");
			$('body').append(this.$waiter);
		}
		this.$waiter.fadeIn('fast');
	},
	hideWaiter: function() {
		this.$waiter.fadeOut('fast');
	},
	showDialogOverlay: function() {
		if(!this.$dialog_overlay) {
			this.$dialog_overlay = $("<div class='ui-dialog-overlay'></div>");
			$('body').append(this.$dialog_overlay);
		}
		this.$dialog_overlay.fadeIn('fast');
	},
	hideDialogOverlay: function() {
		this.$dialog_overlay.fadeOut('fast');
	}	
};

dfb.ui.AccordianGroup = function(options) {
	var settings = $.extend({}, {
		animation_type: 'slide_down',	
		members: [],		
	}, options);	
	var $focused_member = null;
	var on_show = [];
	
	var init = function() {
		var _this = this;
		$.each(settings.members, function() {
			$(this).click(function() { _this.showMember($(this)) });
		});
	};
	
	var runOnShows = function(tag) {
		$.each(on_show, function() {
			if(this.tag == tag) {
				this.func();
			}
		});
	};
	
	this.showMember = function($member, on_completion) {
		if($focused_member && $member.get(0) === $focused_member.get(0)) {
			if(on_completion) {
				on_completion();				
			}
			runOnShows();
			return;
		}
				
		$.each(settings.members, function() {
			$($(this).removeClass('active').data().accordianContentSelector).slideUp('fast');
		});
		$member.addClass('active');
		$($member.data().accordianContentSelector).slideDown('fast', function() { if(on_completion) on_completion(); runOnShows($member.data().tag); });
		$focused_member = $member;
	};
	
	this.showByTag = function(tag, on_completion) {
		var $member = $(settings.members).filter(function() {
			return $(this).data().tag == tag;
		});
		this.showMember($member.get(0), on_completion);
	};
	
	this.onShow = function(tag, on_show_func) {
		on_show.push({tag: tag, func: on_show_func});
	};
	
	(function() {
		init.apply(this);
	}).apply(this);
};

dfb.ui.Window = function(options) {	

	var _this = this;
	var settings = $.extend({}, {
		animation_type: 'slide_down',	
		template_selector: '#ui-window',
		content: 'default content',
		border_type: 'success',
		show_buttons: false,
		yes: (function() { this.remove(); }).bind(_this),
		no: (function() { this.remove(); }).bind(_this),
	}, options);		
	var window_id = dfb.ui.getUniqueID(); 
	var $window = null;
	
	this.show = function() {
		if(!this.$window) {
			var _this = this;
			$window = $($.templates(settings.template_selector).render({
				'window_id': window_id,
				'content': settings.content,
				'border_type': settings.border_type,
				'show_buttons': settings.show_buttons
			}));
			$('body').append($window);
			$window.find('.window-dismiss').click(function() {
				settings.no();
				_this.remove();
			});
		}
		
		switch(settings.animation_type) {
			case 'dialog':
				$window.fadeIn(300);
				$window.find('.jq-yes').on('click', function() {
					settings.yes.call(_this);
					_this.remove();
					return false;
				});
				$window.find('.jq-no').on('click', function() {
					settings.no.call(_this);
					_this.remove();
					return false;
				});
				break;
			default:
				$window.slideDown(300);
		}
		
	};
	
	this.remove = function() {		
		var removeElement = function() { $window.remove() };
		
		switch(settings.animation_type) {
			case 'dialog':
				$window.fadeOut(removeElement);
				dfb.ui.hideDialogOverlay();
				break;
			default:
				$window.slideUp(removeElement);
		}				
	};
	
};

dfb.ui.Window.showYesNoDialog = function(options) {
	var settings = $.extend({}, {
		animation_type: 'dialog',	
		template_selector: '#ui-window',		
		border_type: 'warning centered',
		show_buttons: true
	}, options);
	
	var window = new dfb.ui.Window(settings);
	window.show();
	dfb.ui.showDialogOverlay();
};