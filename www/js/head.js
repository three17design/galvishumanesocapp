function loadContent(url, selector, content, callback){
        jQuery('#sideloader').html('');
		$.ajax({
		    url: url,
		    type: 'GET',
		    timeout: 15000,
		    success: function(res) {
		        var text = res.responseText;
		        var data = jQuery.parseHTML(text);
		        var pageInfo = jQuery(data).find(content);
		        jQuery(selector).html(pageInfo);
		        if(content == '.main-navigation > .sidebarmenu'){
			        setNavPadding();
					$('.menu-toggle').on('click',function(){
						$('.main-navigation > div > ul').slideToggle();
					});
					$('.main-navigation > div > ul').superfish();
					modifyNavigation();
		        } else {
					fixLinks(selector);
					if (url == 'http://galvestonhumane.org/index.php'){
						$('.carousel-next, .carousel-last').remove();
							jQuery('.catPics').carousel({
							  style: 'slide-left',
							  transitionSpeed: 'slow',
							  carouselSpeed: 5000,
							  arrows: true,
							  buttons: false,
							  buttonsTheme: 'lines',
							  stopOnHover: true,
							  carouselHeight: 'dynamic',
							  carouselWidth: 'max'
							});
					}
		        }
			    if (typeof callback === "function") {
			        callback(selector);
			    }
		    },
		    error: function(XMLHttpRequest, textStatus, errorThrown) {
		        jQuery(selector).html('This app needs to connect to the internet to show this information.');
		    }
		});
}


function scrollToDiv(selector){
	document.querySelector(selector).scrollIntoView();
}

function fixLinks(selector){
	$(selector + ' a').each(function(){
		if($(this).attr('href').substring(0, 4) != "http" || $(this).attr('href').substring(0, 2) !== '\/\/'){
			$(this).attr('href', 'http://galvestonhumane.org/' + $(this).attr('href'));
		}
	});
	$(selector + ' img').each(function(){
		if($(this).attr('src').substring(0, 4) != "http"){
			$(this).attr('src', 'http://galvestonhumane.org/' + $(this).attr('src'));
		}
	});
}

function modifyNavigation(){
	$('.main-navigation a').each(function(){
		var link = $(this).attr('href');
		if(link.substring(0, 4) == 'http'){
			$(this).attr('target', '_blank');
		} else if(link == '/calendar' || link == 'Events.php' || link == 'donate.php'){
			$(this).attr('href', 'http://galvestonhumane.org/'+link);
			$(this).attr('target', '_blank');
		} else {
			$(this).click(function(event){
				event.preventDefault();
				loadContent('http://galvestonhumane.org/' + link , '#loader', '.main-content', scrollToDiv);
				if(link == 'index.php'){ loadContent('http://galvestonhumane.org/index.php', '#sideloader', '.sidebar'); }
			});
		}
	});
}

jQuery.ajax = (function(_ajax){

    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';

    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }

    return function(o) {

        var url = o.url;

        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {

            // Manipulate options so that JSONP-x request is made to YQL

            o.url = YQL;
            o.dataType = 'json';

            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };

            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }

            o.success = (function(_success){
                return function(data) {

                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: data.results[0]
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }

                };
            })(o.success);

        }

        return _ajax.apply(this, arguments);

    };

})(jQuery.ajax);