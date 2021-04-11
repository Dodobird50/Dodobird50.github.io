
( function( global ) {
	
	$( document ).ready( function() {
		function Calendar( year, month, day, hour, minute ) {
			this.year = year;
			this.month = month;
			this.day = day;
			this.hour = hour;
			this.minute = minute;
		}
		var body, isMobile, language, baseWidth;
		var resize, timeOfLastCheckForUpdate, checkForUpdates, finishedSetup;
		var base, update, updateNotification, dismissUpdateButton;
		var row1, select0;
		var rowA1, dataDisplay, lefts, widths, rowA2, displayInsignificantEntriesCheckbox, displayInsignificantEntriesLabel, rowA3;
		var colB, usMap, stateCircleData, select2Div, select2, resetChartsButtonDiv, resetChartsButton, charts;
		var lastUpdatedOn, timestamp;
		
		var allData, dataFromToday, entriesFromToday, calendarFromToday, dataFromYesterday, entriesFromYesterday, dataDisplayHeaderHTML, 
		sortingMethod;

		function init() {
			body = document.getElementsByTagName( "body" )[0];
			isMobile = false;
			var displayInsignificantEntries = false;
			try {
				var indexOfLeftBrace = document.cookie.indexOf( "{" );
				var indexOfRightBrace = document.cookie.indexOf( "}" );
				var userSetting = JSON.parse( document.cookie.substring( indexOfLeftBrace, indexOfRightBrace + 1 ) );
				language = userSetting.language || "en-US";
				sortingMethod = userSetting.sortingMethod || "total cases";
				displayInsignificantEntries = userSetting.displayInsignificantEntries || false;
			}
			catch ( error ) {
				language = "en-US";
				sortingMethod = "total cases";
				updateCookies();
			}
			
			switch ( languageIndex() ) {
				case 0: {
					document.title = "Coronavirus tracker";
					break;
				}
				case 1: {
					document.title = "Rastreador de coronavirus";
					break;
				}
				case 2: {
					document.title = "冠状病毒追踪器";
					break;
				}
				case 3: {
					document.title = "Traqueur de coronavirus";
					break;
				}
				case 4: {
					document.title = "コロナウイルストラッカー";
					break;
				}
			}
			var options = document.getElementById( "select0" ).options;
			for ( var i = 0; i < options.length; i++ ) {
				var option = options[i];
			    if ( option.value == language ) {
				      document.getElementById( "select0" ).selectedIndex = i;
				      break;
			    }
			}
			
			if ( navigator.userAgent.match( /Android/i ) || navigator.userAgent.match( /webOS/i ) 
				|| navigator.userAgent.match( /iPhone/i ) || navigator.userAgent.match( /iPad/i ) 
				|| navigator.userAgent.match( /iPod/i ) || navigator.userAgent.match( /BlackBerry/i ) 
				|| navigator.userAgent.match( /Windows Phone/i ) ) {
				isMobile = true;
			}
			
			if ( navigator.userAgent.indexOf( "Win" ) != -1 ) {
				body.style.fontFamily = "Calibri";
			}
			else {
				body.style.fontFamily = "Times New Roman";
			}
			
			
			document.getElementById( "base" ).className = "container-fluid d-block";
			body.style.overflowY = "scroll";
			
			window.displayNationalStats = displayNationalStats;
			window.toggleDisplayInsignificantEntries = toggleDisplayInsignificantEntries;
			window.readjustSizes = readjustSizes;
			finishedSetup = false;
			window.select0Change = select0Change;
			window.select2Change = select2Change;
			window.resetCharts = resetCharts;
			
			var doResize = function() {
				if ( finishedSetup ) {
					if ( baseWidth != base.offsetWidth ) {
						baseWidth = base.offsetWidth;
						readjustSizes();
						
						resize = null;
					}
				}
			};
			window.onresize = function() {
				if ( resize != null ) {
					clearTimeout( resize );
				}
				
				resize = setTimeout( doResize, 250 );
			};
			
			var doCheckForUpdates = function() {
				if ( finishedSetup ) {
					$.get( "../data/last-updated.txt", function( responseText ) {
						if ( timestamp != responseText ) {
							var data1 = timestamp.split( " " );
							var data2 = responseText.split( " " );
							// have updated because data.json would've already been updated for now while last-updated.txt hasn't.
							if ( parseInt( data1[0] ) <= parseInt( data2[0] ) || parseInt( data1[1] ) <= parseInt( data2[1] ) 
								|| parseInt( data1[2] ) <= parseInt( data2[2] ) || parseInt( data1[3] ) <= parseInt( data2[3] )
								|| parseInt( data1[4] ) <= parseInt( data2[4] ) ) {
								// updated. For example, timestamp is 12:00, while time in last-updated.txt is 12:30.
								$.get( "../data/data.json", function( data ) {
									var newAllData = data.data;
									var newDataFromToday = newAllData[newAllData.length - 1];
									// data.
									if ( dataFromToday.year == newDataFromToday.year 
										&& dataFromToday.month == newDataFromToday.month 
										&& dataFromToday.day == newDataFromToday.day 
										&& dataFromToday.hour == newDataFromToday.hour 
										&& dataFromToday.minute == newDataFromToday.minute ) {
											checkForUpdates = setTimeout( doCheckForUpdates, 30000 );
											return;
									}	

									setTimeout( function() {
										processData( data.data );

										var calendar = calendarFromToday;
										var date;
										switch ( languageIndex() ) {
											case 0: {
												date = calendar.month + "/" + calendar.day + "/" + calendar.year;
												break;
											}
											case 1:
											case 3: {
												date = calendar.day + "/" + calendar.month + "/" + calendar.year;
												break;
											}
											case 2:
											case 4: {
												date = calendar.year + "/" + calendar.month + "/" + calendar.day;
												break;
											}
										}

										var time = calendar.hour + ":";
										if ( calendar.minute >= 10 ) {
											time += calendar.minute;
										}
										else {
											time += "0" + calendar.minute;
										}
										
										switch ( languageIndex() ) {
											case 0: {
												lastUpdatedOn = "Last updated on " + date + ", " + time + " ET. Source of data: "
													+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
													+ "worldometers.info/coronavirus/country/us</a>. NOT FOR COMMERICAL USE.";
												break;
											}
											case 1: {
												lastUpdatedOn = "Ultima actualización en " + date + ", " + time + " hora del este. Fuente "
													+ "de datos: <a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
													+ "worldometers.info/coronavirus/country/us</a>. NO ES PARA USO COMERCIAL.";
												break;
											}
											case 2: {
												lastUpdatedOn = "最后更新时间：" + date + "，" + time + " 东部时间。 数据来源： "
													+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
													+ "worldometers.info/coronavirus/country/us</a>。 不用于商业用途。";
												break;
											}
											case 3: {
												lastUpdatedOn = "Dernière mise à jour à " + date + ", " + time + " heure de l'Est. "
													+ "Source de données: <a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
													+ "worldometers.info/coronavirus/country/us</a>. PAS POUR UN USAGE COMMERCIAL.";
												break;
											}
											case 4: {
												lastUpdatedOn = "最終更新日は" + date + "、東部時の" + time + "です。データのソース:"
													+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
													+ "worldometers.info/coronavirus/country/us</a>。商用目的ではありません。";
												break;
											}
										}

										var scrollY = rowA1.scrollTop;
										refreshDataDisplay();
										rowA1.scrollTop = scrollY;
										
										
										loadMap();
										for ( var i = 0; i < charts.length; i++ ) {
											var state = charts[i].state;
											var checked = false;
											if ( i % 2 == 1 ) {
												checked = charts[i].checkbox.checked;
											}
											charts[i].state = null;	// Force reload of data
											updateChart( charts[i], state );
											if ( checked ) {
												charts[i].checkbox.checked = true;
												charts[i].checkbox.onclick();
											}
										}
										timestamp = dataFromToday.year + " " + dataFromToday.month + " " 
											+ dataFromToday.day + " " + dataFromToday.hour + " " + dataFromToday.minute;
										
										scrollY = window.scrollY;	// Get scroll position before update is added
										var updateAlreadyVisible = true;
										if ( update.className == "col-12 d-none" ) {
											update.className = "col-12";
											updateAlreadyVisible = false;
										}
										
										switch ( languageIndex() ) {
											case 0: {
												updateNotification.innerHTML = "An update from " + date + ", " + time + " ET is currently "
													+ "in effect.";
												break;
											}
											case 1: {
												updateNotification.innerHTML = "Una actualización de " + date + ", " + time + 
													" hora del este actualmente está activa.";
												break;
											}
											case 2: {
												updateNotification.innerHTML = "一个从" + date + "，" + time + "东部时间的更新正在生效。";
												break;
											}
											case 3: {
												updateNotification.innerHTML = "Une mise à jour à partir de " + date + ", " + time + 
													" heure de l'Est est actuellement en vigueur.";
												break;
											}
											case 4: {
												updateNotification.innerHTML = "現在、東部時の" + date + "、" + time + "からの更新が有効です。";
												break;
											}
										}
										var w = baseWidth;
										var isUSMapDisplaying = isUSMapVisible();
										var fontSize;
										if ( isUSMapDisplaying ) {
											fontSize = 0.01 * w;
										}
										else {
											fontSize = 0.02 * w;
										}
										updateNotification.style.fontSize = 1.3 * fontSize + "px";
										dismissUpdateButton.style.fontSize = 1.1 * fontSize + "px";
										dismissUpdateButton.style.borderWidth = fontSize / 10 + "px";
										dismissUpdateButton.style.height = updateNotification.offsetHeight + "px";
										update.style.height = 1.8 * updateNotification.offsetHeight + "px";
										var combinedWidth = updateNotification.offsetWidth + dismissUpdateButton.offsetWidth 
											+ 0.1 * w;
										updateNotification.style.left = 0.5 * w - combinedWidth / 2 + "px";
										dismissUpdateButton.style.right = 0.5 * w - combinedWidth / 2 + "px";
										// visible
										if ( !updateAlreadyVisible ) {
											scrollTo( 0, scrollY + update.offsetHeight );
											setTimeout( function() {
												clearTimeout( checkForUpdates );
												checkForUpdates = null;
											}, 100 );
										}
									}, 1 );


									
								} );
							}	
						}
					});
					timeOfLastCheckForUpdate = Date.now();
					checkForUpdates = null;
				}
			};
			
			timeOfLastCheckForUpdate = Date.now(); 
			body.onmousemove = function() {
				if ( checkForUpdates == null ) {
					var timeElapsed = Date.now() - timeOfLastCheckForUpdate;
					if ( timeElapsed < 30000 ) {
						checkForUpdates = setTimeout( doCheckForUpdates, 30000 - timeElapsed );
					}
					else {
						checkForUpdates = setTimeout( doCheckForUpdates, 0 );	
					}
				}
			};
			body.onscroll = function() {
				body.onmousemove();
			};
			document.addEventListener( "visibilitychange", function() {
				if ( document.visibilityState == "visible" ) {
					body.onmousemove();
				}
			});
			body.onmousemove();
			
			base = document.getElementById( "base" );
			baseWidth = base.offsetWidth;
			update = document.getElementById( "update" );
			updateNotification = document.getElementById( "updateNotification" );
			dismissUpdateButton = document.getElementById( "dismissUpdateButton" );
			dismissUpdateButton.onclick = function() {
				update.className = "col-12 d-none";
			};
			switch ( languageIndex() ) {
				case 0: {
					dismissUpdateButton.innerHTML = "OK";
					break;
				}
				case 1: {
					dismissUpdateButton.innerHTML = "Bueno";
					break;
				}
				case 2: {
					dismissUpdateButton.innerHTML = "好的";
					break;
				}
				case 3: {
					dismissUpdateButton.innerHTML = "D'accord";
					break;
				}
				case 4: {
					dismissUpdateButton.innerHTML = "よし";
					break;
				}
			}
			
			row1 = document.getElementById( "row1" );
			var w = baseWidth;
			var fontSize;
			var isUSMapDisplaying = window.getComputedStyle( document.getElementById( "colB" ) ).display != "none";
			if ( isUSMapDisplaying ) {
				fontSize = 0.01 * w;
			}
			else {
				fontSize = 0.02 * w;
			}
			base.style.padding = 0.015 * w + "px";
			row1.style.marginBottom = 0.03 * w + "px";
			
			languageDiv = document.getElementById( "languageDiv" );
			select0 = document.getElementById( "select0" );
			select0.style.position = "relative";
			
			var colAWidth;
			if ( isUSMapDisplaying ) {
				colAWidth = 0.485 * baseWidth;
			}
			else {
				colAWidth = 0.97 * baseWidth;
			}
			
			select0.style.fontSize = 1.25 * fontSize + "px";
			select0.style.width = 16 * fontSize + "px";
			select0.style.left = 0.97 * w - 16 * fontSize + "px";
			languageDiv.style.marginBottom = 0.01 * w + "px";
			
			rowA1 = document.getElementById( "rowA1" );
			dataDisplay = document.getElementById( "dataDisplay" );
			rowA1.style.borderWidth = fontSize / 10 + "px";
			if ( isUSMapDisplaying ) {
				rowA1.style.marginBottom = 0.0075 * w + "px";
			}
			else {
				rowA1.style.marginBottom = 0.015 * w + "px";
			}
			
			displayInsignificantEntriesCheckbox = document.getElementById( "displayInsignificantEntries" );
			displayInsignificantEntriesLabel = document.getElementById( "displayInsignificantEntriesLabel" );
			rowA2 = document.getElementById( "rowA2" );
			if ( isUSMapDisplaying ) {
				displayInsignificantEntriesLabel.style.height = 1.4 * 0.012 * w + "px";
				rowA2.style.height = 1.4 * 0.012 * w + "px";
			}
			else {
				displayInsignificantEntriesLabel.style.height = 1.4 * 0.024 * w + "px";
				rowA2.style.height = 1.4 * 0.024 * w + "px";
			}
			var checkbox = displayInsignificantEntriesLabel.children[0];
			if ( isUSMapDisplaying ) {
				checkbox.style.width = 1.4 * 0.012 * w + "px";
				checkbox.style.height = 1.4 * 0.012 * w + "px";
				displayInsignificantEntriesLabel.children[1].style.lineHeight = 1.4 * 0.012 * w + "px";	// span
			}
			else {
				checkbox.style.width = 1.4 * 0.024 * w + "px";
				checkbox.style.height = 1.4 * 0.024 * w + "px";
				displayInsignificantEntriesLabel.children[1].style.lineHeight = 1.4 * 0.024 * w + "px";	// span
			}
			
			var span = displayInsignificantEntriesLabel.children[1];
			if ( isUSMapDisplaying ) {
				span.style.fontSize = 0.012 * w + "px";
				span.style.left = 0.024 * w + "px";
			}
			else {
				span.style.fontSize = 0.024 * w + "px";
				span.style.left = 0.048 * w + "px";
			}
			switch ( languageIndex() ) {
				case 0: {
					span.innerHTML = "Display states/territories with less than 2,000 cases.";
					break;
				}
				case 1: {
					span.innerHTML = "Mostrar estados/territorios con menos de 2,000 casos.";
					break;
				}
				case 2: {
					span.innerHTML = "显示少于2,000个累计确诊的州/领土。";
					break;
				}
				case 3: {
					span.innerHTML = "Afficher les états/territoires avec moins de 2 000 cas.";
					break;
				}
				case 4: {
					span.innerHTML = "2,000件未満の州/地域を表示します。";
					break;
				}
			}
			displayInsignificantEntriesLabel.style.width = 0.95 * colAWidth;
			
			rowA3 = document.getElementById( "rowA3" );
			colB = document.getElementById( "colB" );
			usMap = document.getElementById( "usMap" );
			
			select2Div = document.getElementById( "select2Div" );
			select2 = document.getElementById( "select2" );
			resetChartsButtonDiv = document.getElementById( "resetChartsButtonDiv" );
			resetChartsButton = document.getElementById( "resetChartsButton" );
			switch ( languageIndex() ) {
				case 0: {
					resetChartsButton.innerHTML = "Reset charts";
					break;
				}
				case 1: {
					resetChartsButton.innerHTML = "Restablecer gráficos";
					break;
				}
				case 2: {
					resetChartsButton.innerHTML = "重置图表";
					break;
				}
				case 3: {
					resetChartsButton.innerHTML = "Réinitialiser les graphiques";
					break;
				}
				case 4: {
					resetChartsButton.innerHTML = "チャートをリセット";
					break;
				}
			}
			select2.style.fontSize = 1.1 * fontSize + "px";
			if ( isUSMapDisplaying ) {
				select2.style.width = 0.4 * select2Div.offsetWidth + "px";
			}
			else {
				select2.style.width = 0.8 * select2Div.offsetWidth + "px";
				
			}
			select2Div.style.height = select2.offsetHeight + "px";
			
			resetChartsButton.style.fontSize = fontSize + "px";
			resetChartsButton.style.borderWidth = fontSize / 10 + "px";
			resetChartsButton.style.height = select2.offsetHeight + "px";
			if ( isUSMapDisplaying ) {
				resetChartsButton.style.width = 0.4 * resetChartsButtonDiv.offsetWidth + "px";
			}
			else {
				resetChartsButton.style.width = 0.8 * resetChartsButtonDiv.offsetWidth + "px";
				
			}
			resetChartsButtonDiv.style.height = resetChartsButton.offsetHeight + "px";

			charts = [ 
				document.getElementById( "totalCasesChart" ), document.getElementById( "newCasesChart" ), 
				document.getElementById( "totalCasesPer100000PeopleChart" ), document.getElementById( "newCasesPer100000PeopleChart" ),
				document.getElementById( "totalDeathsChart" ), document.getElementById( "newDeathsChart" ),
				document.getElementById( "deathRateChart" )
			];
			
			var states = [
				"USA", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
				"Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Guam", "Hawaii", "Idaho",
				"Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
				"Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
				"New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Northern Mariana Islands",
				"Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina",
				"South Dakota", "Tennessee", "Texas", "U.S. Virgin Islands", "Utah", "Vermont", "Virginia",
				"Washington", "West Virginia", "Wisconsin", "Wyoming"
			];
			var finalHTML = "";
			for ( var i = 0; i < states.length; i++ ) {
				var state = states[i];
				var option = document.createElement( "option" );
				option.innerHTML = translate( state );
				option.setAttribute( "value", state );
				select2.appendChild( option );
			}
			
			$.ajaxSetup( { cache: false } );	// Disable cache
			
			$.get( "../data/data.json", function( data ) {
				processData( data.data );
				// timestamp is bound to data.
				timestamp = dataFromToday.year + " " + dataFromToday.month + " " 
					+ dataFromToday.day + " " + dataFromToday.hour + " " + dataFromToday.minute;
				
				var dataDisplayHeaderFile = "../data-display-header-" + language + ".html";
				$.get( dataDisplayHeaderFile, function( responseText ) {
					dataDisplayHeaderHTML = responseText;
					
					var calendar = calendarFromToday;
					var date;
					switch ( languageIndex() ) {
						case 0: {
							date = calendar.month + "/" + calendar.day + "/" + calendar.year;
							break;
						}
						case 1:
						case 3: {
							date = calendar.day + "/" + calendar.month + "/" + calendar.year;
							break;
						}
						case 2: 
						case 4: {
							date = calendar.year + "/" + calendar.month + "/" + calendar.day;
							break;
						}
					}

					var time = calendar.hour + ":";
					if ( calendar.minute >= 10 ) {
						time += calendar.minute;
					}
					else {
						time += "0" + calendar.minute;
					}
					
					switch ( languageIndex() ) {
						case 0: {
							lastUpdatedOn = "Last updated on " + date + ", " + time + " ET. Source of data: "
								+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
								+ "worldometers.info/coronavirus/country/us</a>. NOT FOR COMMERICAL USE.";
							break;
						}
						case 1: {
							lastUpdatedOn = "Ultima actualización en " + date + ", " + time + " hora del este. Fuente "
								+ "de datos: <a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
								+ "worldometers.info/coronavirus/country/us</a>. NO ES PARA USO COMERCIAL.";
							break;
						}
						case 2: {
							lastUpdatedOn = "最后更新时间：" + date + "，" + time + " 东部时间。 数据来源: "
								+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
								+ "worldometers.info/coronavirus/country/us</a>。 不用于商业用途。";
							break;
						}
						case 3: {
							lastUpdatedOn = "Dernière mise à jour à " + date + ", " + time + " heure de l'Est. "
								+ "Source de données: <a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
								+ "worldometers.info/coronavirus/country/us</a>. PAS POUR UN USAGE COMMERCIAL.";
							break;
						}
						case 4: {
							lastUpdatedOn = "最終更新日は" + date + "、東部時の" + time + "です。データのソース:"
								+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
								+ "worldometers.info/coronavirus/country/us</a>。商用目的ではありません。";
							break;
						}
					}
					lefts =  [    0,  0.075, 0.2825, 0.4225, 0.615, 0.765,  0.89];
					
					widths = [0.075, 0.2075,   0.14, 0.1925,  0.15, 0.125, 0.105];
					if ( displayInsignificantEntries ) {
						displayInsignificantEntriesCheckbox.checked = true;
					}
					refreshDataDisplay();	// Includes readjustSizes() for dataDisplay and rowA3
					
					$.get( "../data/state circle data.txt", function( responseText ) {
						stateCircleData = responseText;
						loadMap();
						var h;
						if ( !isUSMapDisplaying ) {
							h = rowA1.offsetWidth * 0.5;
						}
						else {
							h = usMap.height - rowA2.offsetHeight - rowA3.offsetHeight - 0.0075 * w;
						}
						h = Math.min( h, dataDisplay.offsetHeight );
						rowA1.style.height = h + "px";
						select2.style.fontSize = 1.1 * fontSize + "px";
						var col9Width = 0.485 * baseWidth;
						if ( isUSMapDisplaying ) {
							select2.style.width = 0.4 * col9Width + "px";
						}
						else {
							select2.style.width = 0.8 * col9Width + "px";
						}
						select2.style.right = 0.1 * col9Width + "px";
						var select2Height = select2.offsetHeight;
						select2Div.style.height = select2Height + "px";
						select2Div.style.marginBottom = 0.01 * w + "px";
						
						resetChartsButton.style.fontSize = fontSize + "px";
						resetChartsButton.style.borderWidth = fontSize / 10 + "px";
						resetChartsButton.style.height = select2Height + "px";
						if ( isUSMapDisplaying ) {
							resetChartsButton.style.width = 0.4 * col9Width + "px";
						}
						else {
							resetChartsButton.style.width = 0.8 * col9Width + "px";
						}
						resetChartsButton.style.left = 0.1 * col9Width + "px";
						resetChartsButtonDiv.style.height = select2Height + "px";
						resetChartsButtonDiv.style.marginBottom = 0.01 * w + "px";
						
						for ( var i = 0; i < charts.length; i++ ) {
							makeChart( charts[i], "USA", w - parseInt( base.style.paddingLeft ) 
								- parseInt( base.style.paddingRight ) );
							if ( i < charts.length - 1 ) {
								charts[i].style.marginBottom = 0.03 * w + "px";
							}
							
						}
						finishedSetup = true;
					});
				});
			});
		}
		
		function processData( allDataFromJSON ) {
			allData = allDataFromJSON;
			
			for ( var i = 0; i < allData.length; i++ ) {
				var data = allData[i];
				data.getEntry = function( state ) {
					var self = this;
					var entries = self.entries;
					for ( var j = 0; j < entries.length; j++ ) {
						if ( entries[j].s == state ) {
							return entries[j];
						}
					}
					
					return null;
				};
			}
			
			dataFromToday = allData[allData.length - 1];
			entriesFromToday = dataFromToday.entries;
			calendarFromToday = new Calendar( dataFromToday.year, dataFromToday.month, dataFromToday.day, 
				dataFromToday.hour, dataFromToday.minute );
			dataFromYesterday = allData[allData.length - 2];
			entriesFromYesterday = dataFromYesterday.entries;
			
			sortEntries0();
		}

		function compareEntries( entry1, entry2 ) {
			if ( entry1.s == entry2.s )
				return 0;
			
			var tiebreakerOrders;
			if ( sortingMethod.startsWith( "case mortality rate" ) ) {
				tiebreakerOrder = [ "c_m_r", "d", "c", "c_p_c", "s"];
			}
			else if ( sortingMethod.startsWith( "total cases" ) ) {
				if ( sortingMethod.startsWith( "total cases per 100,000 people" ) ) {
					tiebreakerOrder = [ "c_p_c", "c", "d", "c_m_r", "s"];
				}
				else {
					tiebreakerOrder = [ "c", "c_p_c", "d", "c_m_r", "s"];
				}
				
			}
			else if ( sortingMethod.startsWith( "total deaths" ) ) {
				tiebreakerOrder = [ "d", "c_m_r", "c", "c_p_c", "s"];
			}
			
			var reverse = sortingMethod.endsWith( "-reverse" );
			for ( var i = 0; i < tiebreakerOrder.length; i++ ) {
				var tiebreaker = tiebreakerOrder[i];
				var var1 = entry1[tiebreaker];
				var var2 = entry2[tiebreaker];
				var c = var1 - var2;
				if ( reverse ) {
					c = -c;
				}
				if ( c > 0 ) {
					return 1;
				}
				else if ( c < 0 ) {
					return -1;
				}
			}
			// but equality check was made earlier.
			throw new Error( "Bad input for \"sortingMethod\"");
		}
		function sortEntries0() {
			entriesFromToday = sortEntries1( entriesFromToday, 0, entriesFromToday.length - 1 );
			allData[allData.length - 1].entries = entriesFromToday;
		}
		
		function sortEntries1( entries, l, h ) {
			if ( l < h ) {
				var m = Math.trunc( ( l + h ) / 2 );
				entries = sortEntries1( entries, l, m );
				entries = sortEntries1( entries, m + 1, h );
				entries = merge( entries, l, h );
			}
			
			return entries;
		}
		
		function merge( entries, l, h ) {
			if ( l >= h )
				return;
			var m = Math.trunc( ( l + h ) / 2 );
			var index1 = l;
			var index2 = m + 1;
			var sorted = JSON.parse( JSON.stringify( entries ) );
			var index3 = l;
			while ( index1 <= m && index2 <= h ) {
				var entry1 = entries[index1];
				var entry2 = entries[index2];
				var c = compareEntries( entry1, entry2 );
				if ( c > 0 ) {
					sorted[index3] = entry1;
					index3++;
					index1++;
				}
				else if ( c < 0 ) {
					sorted[index3] = entry2;
					index3++;
					index2++;
				}
				else {
					sorted[index3] = entry1;
					index3++;
					sorted[index3] = entry2;
					index3++;
					
					index1++;
					index2++;
				}
			}
			while ( index1 <= m ) {
				var entry1 = entries[index1];
				sorted[index3] = entry1;
				index3++;
				index1++;
			}
			while ( index2 <= h ) {
				var entry2 = entries[index2];
				sorted[index3] = entry2;
				index3++;
				index2++;
			}
			return sorted;
		}
		

		function toggleDisplayInsignificantEntries() {
			var scrollY = rowA1.scrollTop;
			var w = dataDisplay.offsetWidth;
			for ( var i = 1; i < dataDisplay.children.length; i++ ) {
				var row = dataDisplay.children[i];
				if ( !isStateSignificant( row.state ) ) {
					if ( !displayInsignificantEntries() ) {
						row.setAttribute( "class", "row d-none" );
					}
					else {
						row.setAttribute( "class", "row" );
						row.style.paddingLeft = w / 50 + "px";
						row.style.paddingRight = w / 50 + "px";
						var w = dataDisplay.offsetWidth;
						for ( var j = 0; j < row.children.length; j++ ) {
							var child = row.children[j];
							defaultFont( child, i, w );
							child.style.width = widths[j] * ( row.offsetWidth - parseFloat( row.style.paddingLeft ) 
								- parseFloat( row.style.paddingRight ) ) + "px";
						}
					}
				}
			}
			updateCookies();
		}
		
		var sortingMethods = ["total cases", "total cases per 100,000 people", "total deaths", "case mortality rate"];
		function refreshDataDisplay() {
			var scrollY = window.scrollY;	
			dataDisplay.innerHTML = dataDisplayHeaderHTML;
			// scrolled up, so force scroll position of the page to stay the same as before
			window.scrollTo( 0, scrollY );
			var w = dataDisplay.offsetWidth;
			var padding = w / 50 + "px";
			dataDisplay.style.paddingTop = padding;
			dataDisplay.style.paddingBottom = padding;
			
			var dataDisplayHeader = dataDisplay.children[0];
			dataDisplayHeader.style.paddingLeft = padding;
			dataDisplayHeader.style.paddingRight = padding;
			var maxHeight = 0;
			for ( var i = 0; i < dataDisplayHeader.children.length; i++ ) {
				var child = dataDisplayHeader.children[i];
				
				child.style.position = "absolute";
				child.style.bottom = "0px";
				// of dataDisplayHeader to account for paddingLeft
				child.style.left = lefts[i] * 0.96 * w + w / 50 + "px";
				child.style.width = widths[i] * 0.96 * w + "px";
				defaultFont( child, 0, w );
				
				if ( child.offsetHeight > maxHeight ) {
					maxHeight = child.offsetHeight;
				}
				
				if ( i >= 2 && i < 6 ) {
					child.sortingMethod = sortingMethods[i - 2];
					child.onclick = function() {
						var self = this;
						if ( self.state == 0 ) {
							sortingMethod = self.sortingMethod;
							self.style.textDecoration = "underline";
							self.state = 1;
						}
						else if ( self.state == 1 ) {
							sortingMethod = self.sortingMethod + "-reverse";
							self.style.fontStyle = "italic";
							self.state = 2;
						}
						else {
							sortingMethod = self.sortingMethod;
							self.style.fontStyle = "normal";
							self.state = 1;
						}
						
						sortEntries0();
						refreshDataDisplay();
						updateCookies();
						
						for ( var i = 0; i < dataDisplay.children[0].children.length; i++ ) {
							var child = dataDisplay.children[0].children[i];
							if ( child.sortingMethod != self.sortingMethod ) {
								child.style.textDecoration = "normal";
								child.style.fontStyle = "normal";
								child.state = 0;
							}
						}
					};
					
					if ( child.sortingMethod == sortingMethod ) {
						child.style.textDecoration = "underline";
						child.state = 1;
					}
					else if ( child.sortingMethod + "-reverse" == sortingMethod ) {
						child.style.textDecoration = "underline";
						child.style.fontStyle = "italic";
						child.state = 2;
					}
					else {
						child.state = 0;
					}
					
					child.style.cursor = "pointer";
				}
				
			}
			dataDisplayHeader.style.height = maxHeight + "px";
			
			var pos = 1;
			for ( var i = 0; i < entriesFromToday.length; i++ ) {
				var entry = entriesFromToday[i];
				
				var yesterdayEntry;
				for ( var j = 0; j < entriesFromYesterday.length; j++ ) {
					if ( entry.s == entriesFromYesterday[j].s ) {
						yesterdayEntry = entriesFromYesterday[j];
						break;
					}
				}
				
				var row = document.createElement( "div" );
				row.setAttribute( "class", "row" );
				row.setAttribute( "id", entry.s );
				row.state = entry.s;
				
				row.style.position = "relative";
				// right edges too.
				row.style.paddingLeft = w / 50 + "px";
				row.style.paddingRight = w / 50 + "px";
				
				var finalHTML = "";
				finalHTML += '<div>' + pos + '</div>';
				finalHTML += '<div>' + translate( entry.s ) + '</div>';
				finalHTML += '<div>' + entry.c.toLocaleString( language ) + '</div>';
				finalHTML += '<div>' + entry.c_p_c.toLocaleString( language ) + '</div>';
				finalHTML += '<div>' + entry.d.toLocaleString( language ) + '</div>';
				finalHTML += '<div>' + entry.c_m_r.toLocaleString( language ) + '%</div>';
				if ( !isUpdatedToday( entry.s ) ) {
					finalHTML += '<div></div>';
				}
				else {
					finalHTML += '<div>✔</div>';
				}
				row.innerHTML = finalHTML;
				
				
				dataDisplay.appendChild( row );
				for ( var j = 0; j < row.children.length; j++ ) {
					var child = row.children[j];
					defaultFont( child, pos, w );
					child.style.width = widths[j] * ( 0.96 * w ) + "px";
				}
				
				if ( !displayInsignificantEntries() && !isEntrySignificant( entry ) ) {
					row.setAttribute( "class", "row d-none" );
				}
				
				row.onmouseenter = function() {
					var self = this;
					displayStateStats( self.id );
					self.style.backgroundColor = "#e8e8e8";
				};
				row.style.cursor = "pointer";
				row.onmouseleave = function() {
					var self = this;
					self.style.backgroundColor = "transparent";
				}
				
				row.onclick = function() {
					var self = this;
					var state = self.state;
					if ( select2.value != state ) {
						select2.value = state;
						
						for ( var i = 0; i < charts.length; i++ ) {
							var isChecked = false;
							if ( i % 2 == 1 ) {
								isChecked = charts[i].checkbox.checked;
							}
							
							updateChart( charts[i], state );
							if ( isChecked ) {
								charts[i].checkbox.checked = true;
								charts[i].checkbox.onclick();
							}
						}
					}
					
					var y = parseInt( base.style.paddingTop ) + update.offsetHeight + languageDiv.offsetHeight
						+ parseFloat( languageDiv.style.marginBottom ) + row1.offsetHeight 
						+ parseInt( row1.style.marginBottom ) / 2;
					setTimeout( function() {
						window.scrollTo( { left: 0, top: y, behavior: "smooth" } );
						if ( isMobile ) {
							self.onmouseleave();
						}
					}, 1 );
				};
				
				pos++;
			}
			
			displayNationalStats();
		}
		
		function defaultFont( div, pos, dataDisplayWidth ) {
			var colors = [
				"red", "orange", "goldenrod", "green", "blue", "purple", "black"
			];
			if ( pos >= 1 && pos <= 6 ) {
				div.style.color = colors[pos - 1];
			}
			else {
				div.style.color = colors[6];
			}
			
			var fontSize = dataDisplayWidth / 50;
			div.style.fontSize = fontSize + "px";
			div.style.fontWeight = "bold";
			
			div.style.paddingTop = fontSize / 8 + "px";
			div.style.paddingBottom = fontSize / 8 + "px";
			div.style.paddingRight = fontSize / 2 + "px";
		}
		
		function isEntrySignificant( entry ) {
			return entry.c >= 2000;
		}
		
		function isStateSignificant( state ) {
			return isEntrySignificant( dataFromToday.getEntry( state ) );
		}
		
		function readjustSizes() {
			var isUSMapDisplaying = isUSMapVisible();
			var w = baseWidth;
			base.style.padding = 0.015 * w + "px";
			row1.style.marginBottom = 0.03 * w + "px";
			
			var fontSize;
			if ( isUSMapDisplaying ) {
				fontSize = 0.01 * w;
			}
			else {
				fontSize = 0.02 * w;
			}
			if ( update.className == "col-12" ) {
				updateNotification.style.fontSize = 1.3 * fontSize + "px";
				
				dismissUpdateButton.style.fontSize = 1.1 * fontSize + "px";
				dismissUpdateButton.style.borderWidth = fontSize / 10 + "px";
				dismissUpdateButton.style.height = updateNotification.offsetHeight + "px";
				
				update.style.height = 1.8 * updateNotification.offsetHeight + "px";
				var combinedWidth = updateNotification.offsetWidth + dismissUpdateButton.offsetWidth 
					+ 0.1 * w;
				updateNotification.style.left = 0.5 * w - combinedWidth / 2 + "px";
				dismissUpdateButton.style.right = 0.5 * w - combinedWidth / 2 + "px";
			}
			
			select0.style.fontSize = 1.25 * fontSize + "px";
			select0.style.width = 16 * fontSize + "px";
			// get the correct left position
			select0.style.left = 0.97 * w - 16 * fontSize + "px";
			languageDiv.style.marginBottom = 0.01 * w + "px";
			rowA1.style.borderWidth = fontSize / 10 + "px";
			var scrollYRatio = rowA1.scrollTop / dataDisplay.offsetHeight;
			readjustDataDisplayTextFonts();
			
			if ( isUSMapDisplaying ) {
				rowA1.style.marginBottom = 0.0075 * w + "px";
			}
			else {
				rowA1.style.marginBottom = 0.015 * w + "px";
			}
			if ( isUSMapDisplaying ) {
				displayInsignificantEntriesLabel.style.height = 1.4 * 0.012 * w + "px";
				rowA2.style.height = 1.4 * 0.012  * w + "px";
			}
			else {
				displayInsignificantEntriesLabel.style.height = 1.4 * 0.024 * w + "px";
				rowA2.style.height = 1.4 * 0.024 * w + "px";
			}
			
			var checkbox = displayInsignificantEntriesLabel.children[0];
			// and makes it look it shorter
			if ( isUSMapDisplaying ) {
				checkbox.style.width = 1.4 * 0.012 * w + "px";
				checkbox.style.height = 1.4 * 0.012 * w + "px";
				displayInsignificantEntriesLabel.children[1].style.lineHeight = 1.4 * 0.012 * w + "px";	// span
			}
			else {
				checkbox.style.width = 1.4 * 0.024 * w + "px";
				checkbox.style.height = 1.4 * 0.024 * w + "px";
				displayInsignificantEntriesLabel.children[1].style.lineHeight = 1.4 * 0.024 * w + "px";	// span
			}
			
			var span = displayInsignificantEntriesLabel.children[1];
			if ( isUSMapDisplaying ) {
				span.style.fontSize = 0.012 * w + "px";
				span.style.left = 0.024 * w + "px";
			}
			else {
				span.style.fontSize = 0.024 * w + "px";
				span.style.left = 0.048 * w + "px";
			}
			
			var colAWidth;
			if ( isUSMapDisplaying ) {
				colAWidth = 0.485 * baseWidth;
			}
			else {
				colAWidth = 0.97 * baseWidth;
			}
			
			displayInsignificantEntriesLabel.style.width = 0.95 * colAWidth;
			readjustrowA3TextFonts();
			
			if ( isUSMapDisplaying ) {
				loadMap();
			}
			var h;
			if ( !isUSMapDisplaying ) {
				h = rowA1.offsetWidth * 0.5;
			}
			else {
				// usMap.height = 0.75 * (0.97 / 2 * baseWidth - 0.01 - baseWidth)
				h = 0.35625 * baseWidth - parseFloat( rowA2.style.height ) - rowA3.offsetHeight - 0.0075 * w;
			}
			h = Math.min( h, dataDisplay.offsetHeight );
			rowA1.style.height = h + "px";
			rowA1.scrollTop = scrollYRatio * dataDisplay.offsetHeight;
			select2.style.fontSize = 1.1 * fontSize + "px";
			var col9Width = 0.485 * baseWidth;
			if ( isUSMapDisplaying ) {
				select2.style.width = 0.4 * col9Width + "px";
			}
			else {
				select2.style.width = 0.8 * col9Width + "px";
			}
			select2.style.right = 0.1 * col9Width + "px";
			var select2Height = select2.offsetHeight;
			select2Div.style.height = select2Height + "px";
			select2Div.style.marginBottom = 0.01 * w + "px";
			
			resetChartsButton.style.fontSize = fontSize + "px";
			resetChartsButton.style.borderWidth = fontSize / 10 + "px";
			resetChartsButton.style.height = select2Height + "px";
			if ( isUSMapDisplaying ) {
				resetChartsButton.style.width = 0.4 * col9Width + "px";
			}
			else {
				resetChartsButton.style.width = 0.8 * col9Width + "px";
			}
			resetChartsButton.style.left = 0.1 * col9Width + "px";
			resetChartsButtonDiv.style.height = select2Height + "px";
			resetChartsButtonDiv.style.marginBottom = 0.01 * w + "px";
			
			for ( var i = 0; i < charts.length; i++ ) {
				var checked = false;
				if ( i % 2 == 1 ) {
					checked = charts[i].checkbox.checked;
				}
				makeChart( charts[i], charts[i].state, baseWidth - parseInt( base.style.paddingLeft ) 
					- parseInt( base.style.paddingRight ) );
				if ( checked ) {
					charts[i].checkbox.checked = true;
					charts[i].checkbox.onclick();
				}
				if ( i < charts.length - 1 ) {
					charts[i].style.marginBottom = 0.03 * w + "px";
				}
			}
		}

		function readjustDataDisplayTextFonts() {
			var w = dataDisplay.offsetWidth;
			var padding = w / 50 + "px";
			dataDisplay.style.paddingTop = padding;
			dataDisplay.style.paddingBottom = padding;
			
			var dataDisplayHeader = dataDisplay.children[0];
			
			dataDisplayHeader.style.paddingLeft = padding;
			dataDisplayHeader.style.paddingRight = padding;
			
			var maxHeight = 0;
			for ( var i = 0; i < dataDisplayHeader.children.length; i++ ) {
				var child = dataDisplayHeader.children[i];
				defaultFont( child, 0, w );
				child.style.position = "absolute";
				child.style.bottom = "0px";
				child.style.left = lefts[i] * 0.96 * w + w / 50 + "px";
				child.style.width = widths[i] * 0.96 * w + "px";
				
				if ( child.offsetHeight > maxHeight ) {
					maxHeight = child.offsetHeight;
				}
			}
			dataDisplayHeader.style.height = maxHeight + "px";
			
			for ( var i = 1; i < dataDisplay.children.length; i++ ) {
				var row = dataDisplay.children[i];
				row.style.paddingLeft = w / 50 + "px";
				row.style.paddingRight = w / 50 + "px";
				
				for ( var j = 0; j < row.children.length; j++ ) {
					var child = row.children[j];
					defaultFont( child, i, w );
					child.style.width = widths[j] * ( 0.96 * w ) + "px";
				}
			}
		}
		
		function readjustrowA3TextFonts() {
			var w = baseWidth;
			var fontSizes;
			if ( isUSMapVisible() ) {
				fontSizes = [w / 60, w / 100, w / 100, w / 100, w / 100, w / 125];
			}
			else {
				fontSizes = [w / 30, w / 50, w / 50, w / 50, w / 50, w / 62.5];
			}
			var padding = w / 800 + "px";
			for ( var i = 0; i < rowA3.children.length; i++ ) {
				var div = rowA3.children[i];
				div.style.fontSize = fontSizes[i] + "px";
				div.style.paddingBottom = padding;
				if ( i == 0 ) {
					div.style.fontWeight = "bold";
				}
			}
		}
		
		function displayStateStats( state ) {
			var entry = getEntryFromToday( state );
			var yesterdayEntry = getEntryFromYesterday( state );
			var changeInCases = entry.c - yesterdayEntry.c;
			var changeInCasesPer100000People = entry.c_p_c - yesterdayEntry.c_p_c;
			var changeInDeaths = entry.d - yesterdayEntry.d;
			var strings;
			switch ( languageIndex() ) {
				case 0: {
					strings = [
						entry.s + ":",
						
						" - Total cases: " + entry.c.toLocaleString( language ) + " (+" + changeInCases.toLocaleString( language )
							+ " from yesterday)",
							
						"&emsp;&emsp;" + " - Per 100,000 people: " + entry.c_p_c.toLocaleString( language ) 
							+ " (+" + changeInCasesPer100000People.toLocaleString( language ) + " from yesterday)",
							
						" - Total deaths: " + entry.d.toLocaleString( language ) + " (+" + changeInDeaths.toLocaleString( language )
							+ " from yesterday)",
							
						" - Case fatality rate: " + entry.c_m_r.toLocaleString( language ) + "%",
						
						lastUpdatedOn
					];
					break;
				}
				case 1: {
					strings = [
						translate( entry.s ) + ":",
						
						" - Casos totales: " + entry.c.toLocaleString( language ) + " (+" + changeInCases.toLocaleString( language )
							+ " de ayer)",
							
						"&emsp;&emsp;" + " - Por 100,000 personas: " + entry.c_p_c.toLocaleString( language ) 
							+ " (+" + changeInCasesPer100000People.toLocaleString( language ) + " de ayer)",
							
						" - Muertes totales: " + entry.d.toLocaleString( language ) + " (+" + changeInDeaths.toLocaleString( language )
							+ " de ayer)",
							
						" - Tasa de letalidad: " + entry.c_m_r.toLocaleString( language ) + "%",
						
						lastUpdatedOn
					];
					break;
				}
				case 2: {
					strings = [
						translate( entry.s ) + "：",
						
						" - 累计确诊：" + entry.c.toLocaleString( language ) + "（从昨天+" + changeInCases.toLocaleString( language ) 
							+ "）",
							
						"&emsp;&emsp;" + " - 每10万人中：" + entry.c_p_c.toLocaleString( language ) + "（从昨天+" 
							+ changeInCasesPer100000People.toLocaleString( language ) + "）",
							
						" - 累计死亡：" + entry.d.toLocaleString( language ) + "（从昨天+" + changeInDeaths.toLocaleString( language ) 
							+ "）",
							
						" - 病死率：" + entry.c_m_r.toLocaleString( language ) + "%",
						
						lastUpdatedOn
					];
					break;
				}
				case 3: {
					strings = [
						translate( entry.s ) + ":",
						
						" - Nombre total des cas: " + entry.c.toLocaleString( language ) + " (+" 
							+ changeInCases.toLocaleString( language ) + " d'hier)",
							
						"&emsp;&emsp;" + " - Pour 100 000 personnes: " + entry.c_p_c.toLocaleString( language ) 
							+ " (+" + changeInCasesPer100000People.toLocaleString( language ) + " d'hier)",
							
						" - Nombre total des décès: " + entry.d.toLocaleString( language ) + " (+" 
							+ changeInDeaths.toLocaleString( language ) + " d'hier)",
							
						" - Taux de létalité: " + entry.c_m_r.toLocaleString( language ) + "%",
						
						lastUpdatedOn
					];
					break;
				}
				case 4: {
					strings = [
						translate( entry.s ) + "：",
						
						" - 累積診断：" + entry.c.toLocaleString( language ) + "（昨日から+" + changeInCases.toLocaleString( language ) 
							+ "）",
							
						"&emsp;&emsp;" + " - 10万人あたりの：" + entry.c_p_c.toLocaleString( language ) + "（昨日から+" 
							+ changeInCasesPer100000People.toLocaleString( language ) + "）",
							
						" - 累積死亡：" + entry.d.toLocaleString( language ) + "（昨日から+" 
							+ changeInDeaths.toLocaleString( language ) + "）",
							
						" - 致死率：" + entry.c_m_r.toLocaleString( language ) + "%",
						
						lastUpdatedOn
					];
					break;
				}
			}
			var w = baseWidth;
			var fontSizes;
			if ( isUSMapVisible() ) {
				fontSizes = [w / 60, w / 100, w / 100, w / 100, w / 100, w / 125];
			}
			else {
				fontSizes = [w / 30, w / 50, w / 50, w / 50, w / 50, w / 62.5];
			}
			
			rowA3.innerHTML = "";	// Clear content
			var padding = w / 800 + "px";
			for ( var i = 0; i < strings.length; i++ ) {
				var div = document.createElement( "div" );
				strings[i] = strings[i].replaceAll( "+-", "-" );
				div.innerHTML = strings[i];
				div.style.fontSize = fontSizes[i] + "px";
				div.style.paddingBottom = padding;
				if ( i == 0 ) {
					div.style.fontWeight = "bold";
				}
				
				rowA3.appendChild( div );
			}
		}
		
		function displayNationalStats() {
			var changeInCases = dataFromToday.cases - dataFromYesterday.cases;
			var changeInCasesPer100000People = dataFromToday.cases_per_capita - dataFromYesterday.cases_per_capita;
			var changeInDeaths = dataFromToday.deaths - dataFromYesterday.deaths;
			var strings;
			switch ( languageIndex() ) {
				case 0: {
					strings = [ "Across the country:",
					
						" - Total cases: " + dataFromToday.cases.toLocaleString( language ) + " (+" 
							+ changeInCases.toLocaleString( language ) + " from yesterday)",
							
						"&emsp;&emsp;" + " - Per 100,000 people: " 
							+ dataFromToday.cases_per_capita.toLocaleString( language ) + " (+" 
							+ changeInCasesPer100000People.toLocaleString( language ) + " from yesterday)",
							
						" - Total deaths: " + dataFromToday.deaths.toLocaleString( language ) + " (+" 
							+ changeInDeaths.toLocaleString( language ) + " from yesterday)",
							
						" - Case fatality rate: " + dataFromToday.case_mortality_rate.toLocaleString( language ) + "%", 
						
						lastUpdatedOn
					];
					break;
				}
				case 1: {
					strings = [ "A escala nacional:",
					
						" - Casos totales: " + dataFromToday.cases.toLocaleString( language ) + " (+" 
							+ changeInCases.toLocaleString( language ) + " de ayer)",
							
						"&emsp;&emsp;" + " - Por 100,000 personas: " 
							+ dataFromToday.cases_per_capita.toLocaleString( language ) + " (+" 
							+ changeInCasesPer100000People.toLocaleString( language ) + " de ayer)",
							
						" - Muertes totales: " + dataFromToday.deaths.toLocaleString( language ) + " (+" 
							+ changeInDeaths.toLocaleString( language ) + " de ayer)",
							
						" - Tasa de letalidad: " + dataFromToday.case_mortality_rate.toLocaleString( language ) + "%", 
						
						lastUpdatedOn
					];
					break;
				}
				case 2: {
					var strings = [
						"全美国:",
					
						" - 累计确诊: " + dataFromToday.cases.toLocaleString( language ) + "（从昨天+" 
							+ changeInCases.toLocaleString( language ) + "）",
							
						"&emsp;&emsp;" + " - 每10万人中: " + dataFromToday.cases_per_capita.toLocaleString( language ) + "（从昨天+" 
							+ changeInCasesPer100000People.toLocaleString( language ) + "）",
							
						" - 累计死亡: " + dataFromToday.deaths.toLocaleString( language ) + "（从昨天+" 
							+ changeInDeaths.toLocaleString( language ) + "）",
							
						" - 病死率: " + dataFromToday.case_mortality_rate.toLocaleString( language ) + "%", 
						
						lastUpdatedOn
					];
					break;
				}
				case 3: {
					strings = [
						"À l'échelle nationale" + ":",
						
						" - Nombre total des cas: " + dataFromToday.cases.toLocaleString( language ) + " (+" 
							+ changeInCases.toLocaleString( language ) + " d'hier)",
							
						"&emsp;&emsp;" + " - Pour 100 000 personnes: " + dataFromToday.cases_per_capita.toLocaleString( language ) 
							+ " (+" + changeInCasesPer100000People.toLocaleString( language ) + " d'hier)",
							
						" - Nombre total des décès: " + dataFromToday.deaths.toLocaleString( language ) + " (+" 
							+ changeInDeaths.toLocaleString( language ) + " d'hier)",
							
						" - Taux de létalité: " + dataFromToday.case_mortality_rate.toLocaleString( language ) + "%",
						
						lastUpdatedOn
					];
					break;
				}
				case 4: {
					var strings = [
						"全国で：",
					
						" - 累積診断：" + dataFromToday.cases.toLocaleString( language ) + "（昨日から+" 
							+ changeInCases.toLocaleString( language ) + "）",
							
						"&emsp;&emsp;" + " - 10万人あたりの：" + dataFromToday.cases_per_capita.toLocaleString( language ) + "（昨日から+" 
							+ changeInCasesPer100000People.toLocaleString( language ) + "）",
							
						" - 累積死亡：" + dataFromToday.deaths.toLocaleString( language ) + "（昨日から+" 
							+ changeInDeaths.toLocaleString( language ) + "）",
							
						" - 致死率：" + dataFromToday.case_mortality_rate.toLocaleString( language ) + "%", 
						
						lastUpdatedOn
					];
					break;
				}
			}
			var w = baseWidth;
			var fontSizes;
			if ( isUSMapVisible() ) {
				fontSizes = [w / 60, w / 100, w / 100, w / 100, w / 100, w / 125];
			}
			else {
				fontSizes = [w / 30, w / 50, w / 50, w / 50, w / 50, w / 62.5];
			}

			rowA3.innerHTML = "";	// Clear content
			var padding = w / 800 + "px";
			for ( var i = 0; i < strings.length; i++ ) {
				var div = document.createElement( "div" );
				strings[i] = strings[i].replaceAll( "+-", "-" );
				div.innerHTML = strings[i];
				div.style.fontSize = fontSizes[i] + "px";
				div.style.paddingBottom = padding;
				if ( i == 0 ) {
					div.style.fontWeight = "bold";
				}
				
				rowA3.appendChild( div );
			}
		}
	
		function loadMap() {
			if ( !isUSMapVisible() ) {
				return;
			}

			colB.style.paddingLeft = 0.01 * baseWidth + "px";

			var pinnedStates = new Array();
			var boxLeftMultipliers = new Array();
			var boxTopMultipliers = new Array();
			var movedByUsers = new Array();
			for ( var i = 0; i < colB.children.length; i++ ) {
				if ( colB.children[i].className == "state-data-box" ) {
					pinnedStates.push( colB.children[i].state );
					boxLeftMultipliers.push( colB.children[i].circle.boxLeftMultiplier );
					boxTopMultipliers.push( colB.children[i].circle.boxTopMultiplier );
					movedByUsers.push( colB.children[i].movedByUser );
				}
			}

			var mapFound = false;
			var img;
			for ( var i = 0; i < colB.children.length; i++ ) {
				if ( colB.children[i].getAttribute( "src" ) == "../data/us map.png" ) {
					img = colB.children[i];
					mapFound = true;
					break;
				}
			}
			colB.innerHTML = "";
			if ( !mapFound ) {
				img = document.createElement( "img" );
				img.src = "../data/us map.png";
				img.setAttribute( "class", "img-fluid" );
				img.setAttribute( "id", "usMap" );
				usMap = img;
			}
			// leftMargin of colB is 0.01 * baseWidth
			img.width = 0.475 * baseWidth;
			img.height = 0.35625 * baseWidth;
			img.left = 0.01 * baseWidth + "px";
			colB.appendChild( img );
			colB.style.height = 0.35625 * baseWidth + "px";
			
			var states = stateCircleData.split( "\n" );
			var multiplier = 0.00059375 * baseWidth;
			for ( var i = 0; i < states.length; i++ ) {
				if ( states[i] == "" ) {
					continue;
				}
				var data = states[i].split( " " );

				var circle = document.createElement( "span" );
				circle.setAttribute( "class", "circle" );
				circle.style.position = "absolute";

				circle.style.left = data[0] * multiplier + 0.01 * baseWidth + "px";
				circle.style.top = data[1] * multiplier + "px";
				circle.style.width = 2 * data[2] * multiplier + "px";
				circle.style.height = 2 * data[2] * multiplier + "px";
				circle.radius = data[2] * multiplier;
				circle.style.borderRadius = "50%";
				
				var state = data[3];
				state = state.replaceAll( "-", " " );
				circle.state = state;
				if ( !isUpdatedToday( state ) ) {
					circle.style.backgroundColor = "rgb(140, 140, 140)";
				}
				else {
					circle.style.backgroundColor = "red";
				}
				
				circle.isPinned = false;
				if ( !isMobile ) {
					circle.onmouseenter = function() {
						var self = this;
						if ( !self.isPinned ) {
							var box = self.stateDataBox;
							if ( self.stateDataBox == undefined ) {
								self.stateDataBox = getStateDataBox( self );
								box = self.stateDataBox;
								colB.appendChild( box );
								
								var maxWidth = box.children[0].offsetWidth;
								for ( var i = 1; i < box.children.length; i++ ) {
									if ( box.children[i].offsetWidth > maxWidth ) {
										maxWidth = box.children[i].offsetWidth;
									}
								}
								var multiplier = usMap.width / 800;
								var padding = 9 * multiplier;
								// create an illusion of have padding for left padding, and 3 * padding for right padding.
								box.style.width = maxWidth + 4 * padding + "px";
							}
							else {
								colB.appendChild( box );
							}
							defaultPositioningOfStateDataBox( self, box );
						}
					};
					circle.onmouseleave = function() {
						var self = this;
						if ( !self.isPinned ) {
							colB.removeChild( self.stateDataBox );
							self.stateDataBox.movedByUser = false;
						}
					};
					circle.onclick = function() {
						var self = this;
						self.isPinned = !self.isPinned;
						if ( self.isPinned ) {
							if ( self.style.backgroundColor == "red" ) {
								self.style.backgroundColor = "rgb(150, 0, 0)";
							}
							else if ( self.style.backgroundColor = "rgb(140, 140, 140)" ) {
								self.style.backgroundColor = "rgb(75, 75, 75)";
							}
							
						}
						else {
							if ( self.style.backgroundColor == "rgb(150, 0, 0)" ) {
								self.style.backgroundColor = "red";
							}
							else if ( self.style.backgroundColor == "rgb(75, 75, 75)" ) {
								self.style.backgroundColor = "rgb(140, 140, 140)";
							}
						}
					};
				}
				else {
					circle.ontouchend = function() {
						var self = this;
						if ( !self.isPinned ) {
							var box = self.stateDataBox;
							if ( self.stateDataBox == undefined ) {
								self.stateDataBox = getStateDataBox( self );
								box = self.stateDataBox;
								colB.appendChild( box );
								
								var maxWidth = box.children[0].offsetWidth;
								for ( var i = 1; i < box.children.length; i++ ) {
									if ( box.children[i].offsetWidth > maxWidth ) {
										maxWidth = box.children[i].offsetWidth;
									}
								}
								var multiplier = usMap.width / 800;
								var padding = 9 * multiplier;
								// create an illusion of have padding for left padding, and 3 * padding for right padding.
								box.style.width = maxWidth + 4 * padding + "px";
							}
							else {
								colB.appendChild( box );
							}
							defaultPositioningOfStateDataBox( self, box );
						}
						self.isPinned = !self.isPinned;
						if ( self.isPinned ) {
							if ( self.style.backgroundColor == "red" ) {
								self.style.backgroundColor = "rgb(150, 0, 0)";
							}
							else if ( self.style.backgroundColor = "rgb(140, 140, 140)" ) {
								self.style.backgroundColor = "rgb(75, 75, 75)";
							}
							
						}
						else {
							if ( self.style.backgroundColor == "rgb(150, 0, 0)" ) {
								self.style.backgroundColor = "red";
							}
							else if ( self.style.backgroundColor == "rgb(75, 75, 75)" ) {
								self.style.backgroundColor = "rgb(140, 140, 140)";
							}
						}
						if ( !self.isPinned ) {
							colB.removeChild( self.stateDataBox );
						}
					};
				}
					
				document.getElementById( "colB" ).appendChild( circle );
			}
				
			while ( pinnedStates.length > 0 ) {
				var state = pinnedStates.shift();
				for ( var i = 0; i < colB.children.length; i++ ) {
					var circle = colB.children[i];
					// before loadMap() was called
					if ( circle.className == "circle" && circle.state == state ) {
						if ( !isMobile ) {
							circle.onmouseenter();
							circle.click();
						}
						else {
							circle.ontouchend();
						}
						
						var box = circle.stateDataBox;
						
						if ( movedByUsers.shift() ) {
							var boxLeftMultiplier = boxLeftMultipliers.shift();
							var boxTopMultiplier = boxTopMultipliers.shift();
							
							var left = boxLeftMultiplier * colB.offsetWidth;
							if ( left + box.offsetWidth < colB.offsetWidth ) {
								circle.boxLeftMultiplier = boxLeftMultiplier;
							}
							else {
								// change, which alters the width of many things with respect to everything else).
								// the lanugage, it might now extend rightwards with respect to colB beyond the end of colB.
								// respect to colB.
								left = colB.offsetWidth - box.offsetWidth;
								circle.boxLeftMultiplier = left / colB.offsetWidth;
							}
							box.style.left = left + "px";
							// so box cannot move/expand upwards or downwards with respect to colB.
							circle.boxTopMultiplier = boxTopMultiplier;
							circle.stateDataBox.style.top = boxTopMultiplier * colB.offsetHeight + "px";
							
							box.movedByUser = true;
						}
						else {
							boxLeftMultipliers.shift();
							boxTopMultipliers.shift();
						}
						
						break;
					}
				}
			}
				
			colB.activeBox = null;
			if ( !isMobile ) {
				colB.onmousemove = function( event ) {
					var self = this;
					if ( event.pageX >= self.offsetLeft && event.pageX < self.offsetLeft + parseFloat( colB.style.paddingLeft ) ) {
						self.onmouseleave();
					}
					
					if ( self.activeBox != null ) {
						var box = self.activeBox;
						var circle = box.circle;
						event.preventDefault();
						box.doNotRedirect = true;
						box.movedByUser = true;
						
						var newPageXOfBox = event.pageX - box.deltaX;
						var newLeft = newPageXOfBox - colB.offsetLeft;
						if ( newLeft < parseFloat( colB.style.paddingLeft ) ) {
							newLeft = parseFloat( colB.style.paddingLeft );
						}
						else if ( newLeft + box.offsetWidth > colB.offsetWidth ) {
							newLeft = colB.offsetWidth - box.offsetWidth;
						}
						var newPageYOfBox = event.pageY - box.deltaY;
						var newTop = newPageYOfBox - colB.offsetTop;
						if ( newTop < 0 ) {
							newTop = 0;
						}
						else if ( newTop + box.offsetHeight > colB.offsetHeight ) {
							newTop = colB.offsetHeight - box.offsetHeight;
						}
						
						box.style.left = newLeft + "px";
						box.style.top = newTop + "px";
						
						circle.boxLeftMultiplier = parseFloat( box.style.left ) / colB.offsetWidth;
						circle.boxTopMultiplier= parseFloat( box.style.top ) / colB.offsetHeight;
					}
				}
				
				colB.onmouseleave = function() {
					var self = this;
					if ( self.activeBox ) {
						var box = self.activeBox;
						box.active = false;
						box.deltaX = null;
						box.deltaY = null;
						colB.activeBox = null;
					}
				}
			}
		}

		function defaultPositioningOfStateDataBox( circle, box ) {
			var distance = circle.radius + usMap.height / 150;
			var width = box.offsetWidth;
			var height = box.offsetHeight;
			var centerX = parseFloat( circle.style.left ) + circle.radius;
			var centerY = parseFloat( circle.style.top ) + circle.radius;
			// circle.boxLeftMultiplier: the left of its stateDataBox with respect to colB (= 0 when left is at colB's left
			// circle.boxTopMultiplier: the top of its stateDataBox with respect to colB
			if ( centerX + width + distance < colB.offsetWidth ) {
				box.style.left = centerX + distance + "px";
				circle.boxLeftMultiplier = ( centerX + distance ) / colB.offsetWidth;
			}
			else {
				box.style.left = centerX - width - distance + "px";
				circle.boxLeftMultiplier = ( centerX - width - distance ) / colB.offsetWidth;
			}
			if ( centerY + height + distance < colB.offsetHeight ) {
				box.style.top = centerY + distance + "px";
				circle.boxTopMultiplier = ( centerY + distance ) / colB.offsetHeight;
			}
			else {
				box.style.top = centerY - height - distance + "px";
				circle.boxTopMultiplier = ( centerY - height - distance ) / colB.offsetHeight;
			}
		}

		function getStateDataBox( circle ) {
			var box = document.createElement( "div" );
			box.setAttribute( "class", "state-data-box" );
			box.state = circle.state;
			box.circle = circle;
			
			box.style.position = "absolute";
			var multiplier = usMap.width / 800;
			// box.style.width = width + "px";
			var height = 112 * multiplier;
			box.style.height = height + "px";
			
			var entry = getEntryFromToday( circle.state );
			var yesterdayEntry = getEntryFromYesterday( circle.state );
			var deltaC = entry.c - yesterdayEntry.c;
			var deltaC_p_c = entry.c_p_c - yesterdayEntry.c_p_c;
			var deltaD = entry.d - yesterdayEntry.d;
			var strings;
			switch ( languageIndex() ) {
				case 0: {
					strings = [ 
						circle.state, 
						
						" - Total cases: " + entry.c.toLocaleString( language ) + " (+" + deltaC.toLocaleString( language ) + ")",
						
						"&emsp;&emsp;" + " - Per 100,000 people: " + entry.c_p_c.toLocaleString( language ) + " (+" 
							+ deltaC_p_c.toLocaleString( language ) + ")",	// 8 spaces before everything else
							
						" - Total deaths: " + entry.d.toLocaleString( language ) + " (+" + deltaD.toLocaleString( language ) + ")", 
						
						" - Case fatality rate: " + entry.c_m_r.toLocaleString( language ) + "%"
					];
					break;
				}
				case 1: {
					strings = [ 
						translate( circle.state ), 
						" - Casos totales: " + entry.c.toLocaleString( language ) + " (+" + deltaC.toLocaleString( language ) + ")",
						
						"&emsp;&emsp;" + " - Por 100,000 personas: " + entry.c_p_c.toLocaleString( language ) + " (+" 
							+ deltaC_p_c.toLocaleString( language ) + ")",	// 8 spaces before everything else
							
						" - Muertes totales: " + entry.d.toLocaleString( language ) + " (+" + deltaD.toLocaleString( language ) + ")", 
						
						" - Tasa de letalidad: " + entry.c_m_r.toLocaleString( language ) + "%"
					];
					break;
				}
				case 2: {
					strings = [ 
						translate( circle.state ), 
						" - 累计确诊: " + entry.c.toLocaleString( language ) + "（+" + deltaC.toLocaleString( language ) + "）",
						
						"&emsp;&emsp;" + " - 每10万人中: " + entry.c_p_c.toLocaleString( language ) + "（+" 
							+ deltaC_p_c.toLocaleString( language ) + "）",	// 8 spaces before everything else
							
						" - 累计死亡: " + entry.d.toLocaleString( language ) + "（+" + deltaD.toLocaleString( language ) + "）", 
						
						" - 病死率: " + entry.c_m_r.toLocaleString( language ) + "%"
					];
					break;
				}
				case 3: {
					strings = [
						translate( circle.state ) + ":",
						" - Nombre total des cas: " + entry.c.toLocaleString( language ) + " (+" 
							+ deltaC.toLocaleString( language ) + ")",
							
						"&emsp;&emsp;" + " - Pour 100 000 personnes: " + entry.c_p_c.toLocaleString( language ) 
							+ " (+" + deltaC_p_c.toLocaleString( language ) + ")",
							
						" - Nombre total des décès: " + entry.d.toLocaleString( language ) + " (+" 
							+ deltaD.toLocaleString( language ) + ")",
						
						" - Taux de létalité: " + entry.c_m_r.toLocaleString( language ) + "%",
					];
					break;
				}
				case 4: {
					strings = [
						translate( entry.s ) + "：",
						
						" - 累積診断：" + entry.c.toLocaleString( language ) + "（+" + deltaC.toLocaleString( language ) 
							+ "）",
							
						"&emsp;&emsp;" + " - 10万人あたりの：" + entry.c_p_c.toLocaleString( language ) + "（+" 
							+ deltaC_p_c.toLocaleString( language ) + "）",
							
						" - 累積死亡：" + entry.d.toLocaleString( language ) + "（+" 
							+ deltaD.toLocaleString( language ) + "）",
							
						" - 病死率：" + entry.c_m_r.toLocaleString( language ) + "%",
					];
					break;
				}
			}

			var y = 4 * multiplier;
			for ( var i = 0; i < strings.length; i++ ) {
				strings[i] = strings[i].replaceAll( "+-", "-" );
				var temp = document.createElement( "div" );
				temp.style.left = 9 * multiplier + "px";
				temp.innerHTML = strings[i];
				if ( i == 0 ) {
					temp.style.fontSize = 18 * multiplier + "px";
					temp.style.top = y + "px";
					temp.style.fontWeight = "bold";
					y += 25 * multiplier;
				}
				else {
					temp.style.fontSize = 12 * multiplier + "px";
					temp.style.top = y + "px";
					y += 18 * multiplier;
				}
				
				temp.style.whiteSpace = "nowrap";	
				box.appendChild( temp );
			}
			for ( var i = 0; i < box.children.length; i++ ) {
				box.children[i].style.position = "absolute";
			}
			
			box.style.backgroundColor = "lightyellow";
			box.style.borderStyle = "solid";
			box.style.borderWidth = 3 * multiplier + "px";
			box.style.borderColor = "black";
			box.style.overflowX = "hidden";
			
			box.style.cursor = "pointer";
			box.movedByUser = false;
			if ( !isMobile ) {
				// of the box
				box.deltaX = null;	
				box.deltaY = null;
				box.onmousedown = function( event ) {
					var self = this;
					self.active = true;
					colB.activeBox = self;
					if ( event.target == self ) {
						self.deltaX = event.offsetX;
						self.deltaY = event.offsetY;
					}
					else {
						for ( var i = 0; i < self.children.length; i++ ) {
							if ( event.target == self.children[i] ) {
								self.deltaX = event.offsetX + parseFloat( self.children[i].style.left );
								self.deltaY = event.offsetY + parseFloat( self.children[i].style.top );
							}
						}
					}
					for ( var i = 0; i < colB.children.length; i++ ) {
						if ( colB.children[i] == self ) {
							if ( i < colB.children.length - 1 ) {
								colB.removeChild( self );
								colB.appendChild( self );
								self.doNotRedirect = true;
							}
							else {
								self.doNotRedirect = false;
							}
							
							break;
						}
					}
				}
				box.onmouseup = function( event ) {
					var self = this;
					self.active = false;
					self.deltaX = null;
					self.deltaY = null;
					
					colB.activeBox = null;
					
					if ( !self.doNotRedirect ) {
						var state = self.state;
						if ( select2.value != state ) {
							select2.value = state;
							for ( var i = 0; i < charts.length; i++ ) {
								var isChecked = false;
								if ( i % 2 == 1 ) {
									isChecked = charts[i].checkbox.checked;
								}
								
								updateChart( charts[i], state );
								if ( isChecked ) {
									charts[i].checkbox.checked = true;
									charts[i].checkbox.onclick();
								}
							}
						}
						
						var y = parseInt( base.style.paddingTop ) + update.offsetHeight + languageDiv.offsetHeight
							+ parseFloat( languageDiv.style.marginBottom ) + row1.offsetHeight 
							+ parseInt( row1.style.marginBottom ) / 2;
						setTimeout( function() {
							window.scrollTo( { left: 0, top: y, behavior: "smooth" } );
						}, 1 );
					}
				}
			}
			else {
				box.ontouchend = function() {
					var self = this;
					var state = self.state;
					if ( select2.value != state ) {
						select2.value = state;
						for ( var i = 0; i < charts.length; i++ ) {
							updateChart( charts[i], state );
						}
					}
					
					var y = parseInt( base.style.paddingTop ) + update.offsetHeight + languageDiv.offsetHeight
						+ parseFloat( languageDiv.style.marginBottom ) + row1.offsetHeight 
						+ parseInt( row1.style.marginBottom ) / 2;
					setTimeout( function() {
						window.scrollTo( { left: 0, top: y, behavior: "smooth" } );
					}, 1 );
				};
			}
			
			return box;
		}
		
		function getEntryFromToday( state ) {
			return dataFromToday.getEntry( state );
		}
		
		function getEntryFromYesterday( state ) {
			for ( var i = 0; i < entriesFromYesterday.length; i++ ) {
				if ( entriesFromYesterday[i].s == state ) {
					return entriesFromYesterday[i];
				}
			}
			
			return null;
		}
		
		function select2Change() {
			var state = select2.value;
			for ( var i = 0; i < charts.length; i++ ) {
				var isChecked = false;
				if ( i % 2 == 1 ) {
					isChecked = charts[i].checkbox.checked;
				}
				
				updateChart( charts[i], state );
				if ( isChecked ) {
					charts[i].checkbox.checked = true;
					charts[i].checkbox.onclick();
				}
			}
		}
		
		function resetCharts() {
			if ( select2.value != "USA" ) { 
				select2.value = "USA";
				for ( var i = 0; i < charts.length; i++ ) {
					var checked = false;
					if ( i % 2 == 1 ) {
						checked = charts[i].checkbox.checked;
					}
					updateChart( charts[i], "USA" );
					if ( checked ) {
						charts[i].checkbox.checked = true;
						charts[i].checkbox.onclick();
					}
				}
			}
		}
		
		function updateChart( chart, state ) {
			makeChart( chart, state, baseWidth - parseInt( base.style.paddingLeft ) 
				- parseInt( base.style.paddingRight ) );
		}
		// totalDeathsPer100000PeopleChart, totalDeathsChart, and newDeathsChart
		function makeChart( chart, state, width ) {
			if ( state == undefined && chart.state == undefined ) {
				if ( chart.state == undefined ) {
					throw new Error( "state must be defined" );
				}
				else {
					state = chart.state;
				}
			}
			
			if ( chart.field == undefined && getField( chart.id ) != -1 ) {
				chart.field = getField( chart.id );
			}
			if ( chart.field == undefined ) {
				throw new Error( "provided div must be a chart" );
			}
			else if ( chart.canvas != undefined && ( chart.field % 2 == 1 && chart.canvas2 != undefined ) 
				&& chart.canvas.offsetWidth == width && chart.state == state ) {
				return;
			}

			chart.innerHTML = "";	// Reset
			var style = chart.style;
			
			chart.style.width = width + "px";
			var height = width * 0.375;	// height is 3/8 of width
			chart.style.height = height + "px";
			if ( chart.toXCoordinate == undefined ) {
				chart.toXCoordinate = function( x ) {
					var self = this;
					var w = parseFloat( self.style.width );
					return 0.9 * w / ( self.xAxisRange - 1 ) * ( x - 1 ) + 0.07 * w;
				};
				chart.toX = function( xCoordinate ) {
					var self = this;
					var w = parseFloat( self.style.width );
					if ( xCoordinate >= 0.07 * w && xCoordinate <= 0.97 * w )
						return ( self.xAxisRange - 1 ) / ( 0.9 * w ) * ( xCoordinate - 0.07 * w ) + 1;
					else if ( xCoordinate >= 0.06 * w && xCoordinate <= 0.07 * w ) // Margin of error in xCoordinate
						return 1;
					else if ( xCoordinate >= 0.97 * w && xCoordinate <= 0.98 * w ) // Margin of error in xCoordinate
						return self.xAxisRange;
					else
						return -1;
				};
				chart.toYCoordinate = function( y ) {
					var self = this;
					var h = parseFloat( self.style.height );
					return -0.8 * h / self.yAxisRange * y + 0.85 * h;
				};
			}
			
			
			style.borderStyle = "solid";
			style.borderWidth = width / 1000 + "px";
			
			var numberOfPoints = chart.xAxisRange;
			if ( chart.state != state ) {
				var numberOfPoints;
				if ( chart.field % 2 == 0 ) {
					numberOfPoints = allData.length;
				}
				else {
					numberOfPoints = allData.length - 1;
				}
				chart.state = state;
				chart.months = new Array( numberOfPoints );
				chart.days = new Array( numberOfPoints );
				chart.years = new Array( numberOfPoints );
				chart.numbers = new Array( numberOfPoints );	// Number of cases, cases per 100,000 people, or deaths
				chart.sevenDayMovingAverages;
				if ( chart.field % 2 == 1 ) {
					chart.sevenDayMovingAverages = new Array( numberOfPoints );
				}
				var max = 0;
				var dataValues = [ "cases", "cases", "cases_per_capita", "cases_per_capita", "deaths", "deaths", "case_mortality_rate"];
				var dataValuesForIndividualEntries = [ "c", "c", "c_p_c", "c_p_c", "d", "d", "c_m_r"];
				if ( chart.field % 2 == 0 ) {
					for ( var i = 0; i < allData.length; i++ ) {
						var data = allData[i];
						chart.months[i] = data.month;
						chart.days[i] = data.day;
						chart.years[i] = data.year;
						if ( chart.state == "USA" ) {
							chart.numbers[i] = data[dataValues[chart.field]];
						}
						else {
							var entry = data.getEntry( chart.state );
							chart.numbers[i] = entry[dataValuesForIndividualEntries[chart.field]];
						}
						
						if ( chart.numbers[i] > max ) {
							max = chart.numbers[i];
						}
					}
				}
				else {
					for ( var i = 1; i < allData.length; i++ ) {
						var data = allData[i];
						var yesterdayData = allData[i - 1];
						chart.months[i - 1] = data.month;
						chart.days[i - 1] = data.day;
						chart.years[i - 1] = data.year;
						if ( chart.state == "USA" ) {
							chart.numbers[i - 1] = data[dataValues[chart.field]] - yesterdayData[dataValues[chart.field]];
						}
						else {
							var entry = data.getEntry( chart.state );
							var yesterdayEntry = yesterdayData.getEntry( chart.state );
							chart.numbers[i - 1] = entry[dataValuesForIndividualEntries[chart.field]] 
							- yesterdayEntry[dataValuesForIndividualEntries[chart.field]];
						}
						if ( chart.numbers[i - 1] > max ) {
							max = chart.numbers[i - 1];
						}
					} 
				}
				
				
				if ( max >= 1 ) {
					chart.exponent = parseInt( Math.log10( max ) );
					chart.multiplier = max / Math.pow( 10, chart.exponent );
				}
				else {
					chart.exponent = 0;
					chart.multiplier = 1;
				}
				
				if ( chart.field != 6 ) {
					if ( chart.multiplier < 1.44375 && chart.exponent > 0 ) {
						// rounded down for yAxisRange, satisfying the requirement that the multiplier for yAxisRange <= 15.
						chart.multiplier *= 10;
						chart.exponent--;
					}
				}
				else {
					if ( chart.multiplier < 1.44375 && chart.exponent > -1 ) {
						// rounded down for yAxisRange, satisfying the requirement that the multiplier for yAxisRange <= 15.
						chart.multiplier *= 10;
						chart.exponent--;
					}
				}
				
				chart.xAxisRange = numberOfPoints;
				// max = 75,000, multiplier = 7.5, exponent = 4, then yAxisRange = 8*10^4 = 80,000
				// max = 7,011, multiplier = 7.011, exponent = 3, then yAxisRange = 7*10^3 = 7,000.
				if ( max >= 1 ) {
					// only occur if decimal is below a certain threshold.
					if ( chart.multiplier < 1.03125 * parseInt( chart.multiplier ) ) {
						chart.yAxisRange = parseInt( chart.multiplier ) * Math.pow( 10, chart.exponent );
					}
					else {
						chart.yAxisRange = parseInt( chart.multiplier + 1 ) * Math.pow( 10, chart.exponent );
					}	
				}
				else {
					chart.yAxisRange = 1;
				}
			}
			
			var pointsForPolyline1 = "";
			var pointsForPolyline2 = "";
			for ( var x = 0; x < numberOfPoints; x++ ) {
				var number = chart.numbers[x];
				if ( chart.field != 6 && x == numberOfPoints - 1 ) {
					if ( chart.field % 2 == 0 ) {
						var difference = chart.numbers[x] - chart.numbers[x - 1];
						if ( difference <= 0 ) {
							continue;
						}
					}
					else {
						var difference = chart.numbers[x];
						if ( difference <= 0 ) {
							continue;
						}
					}
				}
				
				var xCoordinate = chart.toXCoordinate( x + 1 );
				var yCoordinate = chart.toYCoordinate( number );
				pointsForPolyline1 += xCoordinate + "," + yCoordinate + " ";
				
				if ( chart.field % 2 == 1 && x >= 6 ) {
					var sum = 0;
					for ( var i = x - 6; i <= x; i++ ) {
						sum += chart.numbers[i];
					}
					chart.sevenDayMovingAverages[x] = sum / 7;
					
					
					if ( x >= 7 ) {
						var xCoordinate2 = xCoordinate;
						var yCoordinate2 = chart.toYCoordinate( chart.sevenDayMovingAverages[x] );
						
						pointsForPolyline2 += xCoordinate2 + "," + yCoordinate2 + " ";
					}
				}
			}
			
			var draw = SVG().addTo( "#" + chart.id ).size( width, height );
			draw.node.setAttribute( "id", "svg" + chart.field );
			chart.svg = draw.node;
			var strokesForPolyline1 = ["deepskyblue", "deepskyblue", "mediumpurple", "mediumpurple", "red", "red", "darkorange"];
			chart.polyline1 = draw.polyline( pointsForPolyline1 );
			chart.polyline1.fill( "none" );
			chart.polyline1.stroke( { color: strokesForPolyline1[chart.field], width: width / 400, linecap: 'round', 
				linejoin: 'round' } );
			if ( chart.field % 2 == 1 ) {
				var strokeColorsForPolyline2 = [null, "blue", null, "#6600ff", null, "#aa0000", null];
				chart.polyline2 = draw.polyline( pointsForPolyline2 );
				chart.polyline2.fill( "none" );
				chart.polyline2.stroke( { color: strokeColorsForPolyline2[chart.field], width: width / 400, linecap: 'round', 
					linejoin: 'round' } );
				chart.polyline2.remove();
			}

			chart.cover = document.createElement( "div" );
			chart.cover.style.position = "absolute";
			chart.cover.style.top = 0.85 * height + "px";
			chart.cover.style.left = 0.01 * width + "px";
			chart.cover.style.width = 0.98 * width + "px";
			chart.cover.style.height = 0.14 * height + "px";
			chart.cover.style.textAlign = "bottom";
			chart.appendChild( chart.cover );
			
			chart.xAxis = document.createElement( "div" );
			chart.xAxis.style.position = "absolute";
			chart.xAxis.style.top = 0.85 * height - height / 400 + "px";
			// to the left by the same amount to cover this extension
			chart.xAxis.style.left = 0.06 * width - height / 400 + "px";
			chart.xAxis.style.width = 0.92 * width + height / 400 + "px";
			chart.xAxis.style.height = height / 200 + "px";
			chart.xAxis.style.backgroundColor = "black";
			chart.appendChild( chart.xAxis );
			
			chart.yAxis = document.createElement( "div" );
			chart.yAxis.style.position = "absolute";
			chart.yAxis.style.top = 0.025 * height + "px";
			chart.yAxis.style.left = 0.06 * width - height / 400 + "px";
			chart.yAxis.style.width = height / 200 + "px";
			chart.yAxis.style.height = 0.825 * height + "px";
			chart.yAxis.style.backgroundColor = "black";
			chart.appendChild( chart.yAxis );
			
			var interval = parseInt( chart.xAxisRange / 30 + 1 );
			var horizontalSpacingBetweenPoints = chart.toXCoordinate( 2 ) - chart.toXCoordinate( 1 );
			chart.ticks = new Array();
			chart.labels = new Array();
			for ( var x = 0; x < chart.xAxisRange; x++ ) {
				if ( interval >= 2 ) {
					if ( x % interval == 0 ) {
						var xCoordinate = chart.toXCoordinate( x + 1 );
						var yCoordinate = 0.85 * height;
						var displayDate = document.createElement( "div" );
						switch ( languageIndex() ) {
							case 0:
							case 2:
							case 4: {
								displayDate.innerHTML = chart.months[x] + "/" + chart.days[x];
								break;
							}
							case 1:
							case 3: {
								displayDate.innerHTML = chart.days[x] + "/" + chart.months[x];
								break;
							}
						}
						
						displayDate.style.position = "absolute";
						displayDate.style.width = horizontalSpacingBetweenPoints * interval + "px";
						displayDate.style.textAlign = "center";
						var fontSize = parseInt( horizontalSpacingBetweenPoints * interval / 3 );
						if ( fontSize > 0.015 * width )
							fontSize = 0.015 * width;
						displayDate.style.fontSize = fontSize + "px";
						displayDate.style.left = xCoordinate - horizontalSpacingBetweenPoints * interval / 2 + "px";
						displayDate.style.top = 0.865 * height + "px";
						
						chart.appendChild( displayDate );
						chart.labels.push( displayDate );
						
						var tick = document.createElement( "div" );
						tick.style.position = "absolute";
						tick.style.left = xCoordinate - height / 600 + "px";
						tick.style.top = yCoordinate - 0.01 * height + "px";
						tick.style.width = height / 300 + "px";
						tick.style.height = 0.02 * height + "px";
						tick.style.backgroundColor = "black";
						
						chart.appendChild( tick );
						chart.ticks.push( tick );
					}
				}
				else {
					var xCoordinate = chart.toXCoordinate( x + 1 );
					var yCoordinate = 0.85 * height;
					var displayDate = document.createElement( "div" );
					displayDate.innerHTML = chart.months[x] + "/" + chart.days[x];
					displayDate.style.position = "absolute";
					displayDate.style.width = horizontalSpacingBetweenPoints * interval + "px";
					displayDate.style.textAlign = "center";
					var fontSize = parseInt( horizontalSpacingBetweenPoints * interval / 3 );
					if ( fontSize > 0.015 * width )
						fontSize = 0.015 * width;
					displayDate.style.fontSize = fontSize + "px";
					displayDate.style.left = xCoordinate - horizontalSpacingBetweenPoints * interval / 2 + "px";
					displayDate.style.top = 0.865 * height + "px";
					
					chart.appendChild( displayDate );
					chart.labels.push( displayDate );
					
					var tick = document.createElement( "div" );
					tick.style.position = "absolute";
					tick.style.left = xCoordinate - height / 600 + "px";
					tick.style.top = yCoordinate - 0.01 * height + "px";
					tick.style.width = 0.004 * height + "px";
					tick.style.height = height / 300 + "px";
					tick.style.backgroundColor = "black";
					
					chart.appendChild( tick );
					chart.ticks.push( tick );
				}
			}
			
			var y = chart.yAxisRange;
			var xCoordinate = 0.06 * width;
			while ( y > 0 ) {
				var yCoordinate = chart.toYCoordinate( y );
				var majorTick = document.createElement( "div" );
				majorTick.style.position = "absolute";
				majorTick.style.left = xCoordinate - 0.005 * width + "px";
				majorTick.style.top = yCoordinate - height / 600 + "px";
				majorTick.style.width = 0.01 * width + "px";
				majorTick.style.height = height / 300 + "px";
				majorTick.style.backgroundColor = "black";
				
				chart.appendChild( majorTick );
				chart.ticks.push( majorTick );
				
				var majorTickLabel = document.createElement( "div" );
				if ( chart.field != 6 ) {
					majorTickLabel.innerHTML = y.toLocaleString( language );
				}
				else {
					majorTickLabel.innerHTML = y.toLocaleString( language ) + "%";
				}
				chart.appendChild( majorTickLabel );
				chart.labels.push( majorTickLabel );
				var fontSize = 14 * height / 600;
				majorTickLabel.style.fontSize = fontSize + "px";
				majorTickLabel.style.textAlign = "right";
				majorTickLabel.style.position = "absolute";
				majorTickLabel.style.lineHeight = fontSize + "px";
				majorTickLabel.style.top = yCoordinate - fontSize / 2 + "px";
				majorTickLabel.style.width = 0.053 * width + "px";	
				
				y -= Math.pow( 10, chart.exponent );
			}
			
			if ( chart.field == 2 || chart.field == 3 || chart.field == 6 || chart.exponent > 0 ) {
				y = chart.yAxisRange;
				var decrement;
				var resetSkipNumber;	// Iteration should be skipped every skip'th time. For example, if resetSkipNumber
				var skipCounter = 0;	// When skipCounter reaches 0, then current iteration should be skipped.
				var multiplier1 = chart.yAxisRange / Math.pow( 10, chart.exponent );
				if ( multiplier1 < 5 ) {
					decrement = 2 * Math.pow( 10, chart.exponent - 1 );
					resetSkipNumber = 5;
				}
				else {
					decrement = 5 * Math.pow( 10, chart.exponent - 1 );
					resetSkipNumber = 2;
				}
				while ( y > 0 ) {
					if ( skipCounter == 0 ) {
						y -= decrement;
						skipCounter = resetSkipNumber - 1;
						continue;
					}
					
					var yCoordinate = chart.toYCoordinate( y );
					var minorTick = document.createElement( "div" );
					minorTick.style.position = "absolute";
					minorTick.style.left = xCoordinate - 0.003 * width + "px";
					minorTick.style.top = yCoordinate - height / 600 + "px";
					minorTick.style.width = 0.006 * width + "px";
					minorTick.style.height = height / 300 + "px";
					minorTick.style.backgroundColor = "black";
					
					chart.appendChild( minorTick );
					chart.ticks.push( minorTick );
					
					var minorTickLabel = document.createElement( "div" );
					if ( chart.field != 6 ) {
						minorTickLabel.innerHTML = y.toLocaleString( language );
					}
					else {
						minorTickLabel.innerHTML = y.toLocaleString( language ) + "%";
					}
					chart.appendChild( minorTickLabel );
					chart.labels.push( minorTickLabel );
					var fontSize = 10 * height / 600;
					minorTickLabel.style.fontSize = fontSize + "px";
					minorTickLabel.style.lineHeight = fontSize + "px";
					minorTickLabel.style.textAlign = "right";
					minorTickLabel.style.position = "absolute";
					minorTickLabel.style.top = yCoordinate - fontSize / 2 + "px";
					minorTickLabel.style.width = 0.053 * width + "px";
					
					y -= decrement;
					skipCounter--;
				}
			}
			
			if ( chart.field % 2 == 1 ) {		
				var checkboxDiv = document.createElement( "div" );	
				checkboxDiv.innerHTML = '<label for="display7DayMovingAverage-' + chart.field + '" id="display7DayMovingAverageLabel-"' 
					+ chart.field + '><input id="display7DayMovingAverage-' + chart.field + '" type="checkbox"></label>';	
				var checkbox = checkboxDiv.children[0].children[0];
				checkbox.type = "checkbox";
				checkbox.setAttribute( "id", "display7DayMovingAverage-" + chart.field );
				checkbox.style.width = 1.4 * 0.03 * height + "px";
				checkbox.style.height = 1.4 * 0.03 * height + "px";
				checkbox.chart = chart;
				checkbox.style.position = "absolute";
				checkbox.style.bottom = "0px";
				checkbox.onclick = function() {
					var self = this;
					if ( self.checked ) {
						self.chart.polyline2.addTo( "#svg" + self.chart.field );
						self.chart.polyline1.opacity( 0.32 );
					}
					else {
						self.chart.polyline2.remove();
						self.chart.polyline1.opacity( 1 );
					}
				}
				
				var label = checkboxDiv.children[0];
				label.style.marginBottom = "0px";
				
				var span = document.createElement( "span" );
				switch ( languageIndex() ) {
					case 0: {
						span.innerHTML = "Display 7 day moving average";
						break;
					}
					case 1: {
						span.innerHTML = "Mostrar la media móvil de 7 días";
						break;
					}
					case 2: {
						span.innerHTML = "显示7天移动平均线";
						break;
					}
					case 3: {
						span.innerHTML = "Afficher la moyenne mobile sur 7 jours";
						break;
					}
					case 4: {
						span.innerHTML = "7日間の移動平均を表示";
						break;
					}
				}
				span.style.whiteSpace = "nowrap";
				span.style.fontSize = 0.03 * height + "px";
				span.style.marginBottom = "0px";
				span.style.position = "absolute";
				span.style.left = 0.06 * height + "px";
				span.style.lineHeight = 0.042 * height + "px";
				span.style.bottom = "0px";
				
				label.appendChild( span );
				chart.display7DayMovingAverageLabel = label;
				
				checkboxDiv.appendChild( label );
				checkboxDiv.style.position = "absolute";
				checkboxDiv.style.bottom = 0.025 * height + "px";
				
				chart.appendChild( checkboxDiv );
				// widthOfCheckboxDiv = left of span (incorporates width of checkbox) + width of span
				var widthOfCheckboxDiv = 0.06 * height + span.offsetWidth;
				checkboxDiv.style.width = widthOfCheckboxDiv + "px";
				checkboxDiv.style.left = 0.5 * width - widthOfCheckboxDiv / 2 + "px";
				
				chart.checkbox = checkbox;
			}
			
			chart.titleNode = document.createElement( "div" );
			chart.titleNode.setAttribute( "class", "title" );
			var titles;
			switch ( languageIndex() ) {
				case 0:  {
					titles = [ 
						": total cases", ": new cases", ": total cases per 100,000 people", ": new cases per 100,000 people", 
						": total deaths", ": new deaths", ": case fatality rate"
					];
					break;
				}
				case 1: {
					titles = [ 
						": casos totales", ": nuevos casos", ": casos totales por 100,000 personas", ": nuevos casos por 100,000 personas", 
						": muertes totales", ": nuevos muertes", ": tasa de letalidad"
					];
					break;
				}
				case 2: {
					titles = [ 
						"：累计确诊", "：新确诊", "：每10万人中的累计确诊", "：每10万人中的新确诊", 
						"：累计死亡", "：新死亡", "：病死率"
					];
					break;
				}
				case 3: {
					titles = [ 
						": nombre total des cas", ": nouveaux cas", ": nombre total des cas pour 100 000 personnes", 
						": nouveaux cas pour 100 000 personnes", ": nombre total des décès", ": nouveaux décès", ": taux de létalité"
					];
					break;
				}
				case 4: {
					titles = [ 
						"：累積診断", "：新たに診断された", "：10万人あたりの累積診断", 
						"：10万人あたり新たに診断", "：累積死亡", "新たに死亡された", "：致死率"
					];
					break;
				}
			}
			chart.titleNode.innerHTML = translate( chart.state ) + titles[chart.field];
			if ( getComputedStyle( colB ).display != "none" ) {
				chart.titleNode.style.fontSize = height / 24 + "px";
			}
			else {
				chart.titleNode.style.fontSize = height / 16 + "px";
			}
			chart.titleNode.style.textAlign = "center";
			chart.titleNode.style.position = "absolute";
			chart.titleNode.style.top = "0px";
			chart.titleNode.style.width = "100%";
			chart.appendChild( chart.titleNode );
			chart.resetTitle = function() {
				var self = this;
				self.titleNode.innerHTML = translate( chart.state ) + titles[self.field];
			}
			
			var strings;
			switch ( languageIndex() ) {
				case 0: {
					strings = [ 
						"{s}: {n} total cases as of {m}/{d}/{y}", 
						"{s}: {n} new cases on {m}/{d}/{y}", 
						"{s}: {n} cases per 100,000 people on {m}/{d}/{y}", 
						"{s}: {n} new cases per 100,000 people on {m}/{d}/{y}", 
						"{s}: {n} total deaths on {m}/{d}/{y}", 
						"{s}: {n} new deaths on {m}/{d}/{y}",
						"{s}: {n}% case fatality rate as of {m}/{d}/{y}"
					];
					break;
				}
				case 1: {
					strings = [ 
						"{s}: {n} casos a partir de {d}/{m}/{y}", 
						"{s}: {n} nuevos casos en {d}/{m}/{y}", 
						"{s}: {n} casos por 100,000 personas a partir de {d}/{m}/{y}", 
						"{s}: {n} nuevos casos por 100,000 personas en {d}/{m}/{y}", 
						"{s}: {n} muertes a partir de {d}/{m}/{y}", 
						"{s}: {n} nuevos muertes en {d}/{m}/{y}",
						"{s}: {n}% tasa de letalidad a partir de {d}/{m}/{y}"
					];
					break;
				}
				case 2: {
					strings = [ 
						"{s}:截至{y}/{m}/{d}，共有{n}个确诊", 
						"{s}:{y}/{m}/{d}，有了{n}个新确诊", 
						"{s}:截至{y}/{m}/{d}，每10万人中共有了{n}个确诊", 
						"{s}:{y}/{m}/{d}，每10万人中有了{n}个新确诊", 
						"{s}:截至{y}/{m}/{d}，共有{n}个死亡", 
						"{s}:{y}/{m}/{d}，有了{n}个新死亡",
						"{s}:截至{y}/{m}/{d}，病死率是{n}%"
					];
					break;
				}
				case 3: {
					strings = [ 
						"{s}: {n} cas au {d}/{m}/{y}", 
						"{s}: {n} nouveaux cas au {d}/{m}/{y}", 
						"{s}: {n} cas pour 100000 personnes au {d}/{m}/{y}", 
						"{s}: {n} nuevos casos por 100,000 personas en {d}/{m}/{y}", 
						"{s}: {n} décès au {d}/{m}/{y}", 
						"{s}: {n} nouveaux décès au {d}/{m}/{y}",
						"{s}: {n}% taux de létalité au {d}/{m}/{y}"
					];
					break;
				}
				case 4: {
					strings = [ 
						"{s}：{y}/{m}/{d}の時点で、{n}個の診断があります", 
						"{s}：{y}/{m}/{d}に{n}の新しい診断があります", 
						"{s}：{y}/{m}/{d}の時点で、10万人あたり{n}個の診断があります", 
						"{s}：{y}/{m}/{d}に10万人あたり{n}の新しい診断があります", 
						"{s}：{y}/{m}/{d}の時点で、{n}個の死亡があります", 
						"{s}：{y}/{m}/{d}に{n}の新しい死亡があります", 
						"{s}：{y}/{m}/{d}の時点で、致死率は{n}％です"
					];
					break;
				}
			}
			chart.titlePlaceholder = strings[chart.field];
			
			chart.xOfMouse = -1;
			if ( !isMobile && chart.onmousemove == undefined ) {
				chart.onmousemove = function( event ) {
					var self = this;
					var xCoordinate = event.pageX - parseFloat( base.style.paddingLeft );

					var x = self.toX( xCoordinate );
					x = parseInt( x + 0.5 );
					if ( x <= 0 || x > self.xAxisRange ) {
						self.resetTitle();
						self.xOfMouse = -1;
						return;
					}
					else if ( self.xOfMouse == x ) {
						return;
					}
					if ( self.field != 6 && x == self.xAxisRange ) {
						if ( self.field % 2 == 0 ) {
							var difference = self.numbers[x - 1] - self.numbers[x - 2];
							if ( difference <= 0 ) {
								x--;
							}
						}
						else {
							var difference = self.numbers[x - 1];
							if ( difference <= 0 ) {
								x--;
							}
						}
					}
					
					var numbers = self.numbers;
					finalHTML = self.titlePlaceholder;
					finalHTML = finalHTML.replaceAll( "{s}", translate( self.state ) );
					finalHTML = finalHTML.replaceAll( "{y}", self.years[x - 1] );
					finalHTML = finalHTML.replaceAll( "{m}", self.months[x - 1] );
					finalHTML = finalHTML.replaceAll( "{d}", self.days[x - 1] );
					finalHTML = finalHTML.replaceAll( "{n}", numbers[x - 1].toLocaleString( language ) );
					
					if ( self.field % 2 == 1 && self.checkbox.checked && x >= 7 ) {
						var sevenDayMovingAverages = self.sevenDayMovingAverages;
						switch ( languageIndex() ) {
							case 0: {
								finalHTML += "<br>7 day moving average: ";
								break;
							}
							case 1: {
								finalHTML += "<br>Media móvil de 7 días: ";
								break;
							}
							case 2: {
								finalHTML += "<br>7天移动平均：";
								break;
							}
							case 3: {
								finalHTML += "<br>Moyenne mobile sur 7 jours: ";
								break;
							}
							case 4: {
								finalHTML += "<br>7日間の移動平均：";
								break;
							}
						}
						if ( self.field == 3 ) {
							var sevenDayMovingAverage = sevenDayMovingAverages[x - 1].toFixed( 1 );
							if ( sevenDayMovingAverage == parseInt( sevenDayMovingAverage) ) {
								sevenDayMovingAverage = parseInt( sevenDayMovingAverage );
							}
							finalHTML += sevenDayMovingAverage.toLocaleString( language );
						}
						else {
							finalHTML += parseInt( sevenDayMovingAverages[x - 1] + 0.5 ).toLocaleString( language );
						}
					}
					self.titleNode.innerHTML = finalHTML;
					self.xOfMouse = x;
				};
				chart.onmouseleave = function() {
					var self = this;
					self.resetTitle();
				};
			}
			else if ( isMobile && chart.ontouchmove == undefined ) {
				chart.lastXCoordinate = null;
				chart.lastYCoordinate = null;
				
				chart.ontouchstart = function( event ) {
					var self = this;
					chart.lastXCoordinate = event.pageX - parseFloat( base.style.paddingLeft );
					// y is being recorded and used.
					chart.lastYCoordiante = event.pageY;
				}
				
				chart.ontouchmove = function( event ) {
					var self = this;
      				var xCoordinate = event.pageX - parseFloat( base.style.paddingLeft );
					var yCoordinate = event.pageY;
					
					var deltaY = yCoordinate - self.lastYCoordiante;
					var deltaX = xCoordinate - self.lastXCoordinate;
					// the screen to zoom in/out).
					// shifting the screen
					if ( Math.abs( deltaY / deltaX ) < 1 && event.touches.length < 2 ) {
						event.preventDefault();
						event.stopPropagation();
					}
					
					event.lastXCoordinate = xCoordinate;
					event.lastYCoordiante = yCoordinate;
					
					var x = self.toX( xCoordinate );
					x = parseInt( x + 0.5 );
					if ( x <= 0 || x > self.xAxisRange ) {
						self.resetTitle();
						self.xOfMouse = -1;
						return;
					}
					else if ( self.xOfMouse == x ) {
						return;
					}
					if ( self.field != 6 && x == self.xAxisRange ) {
						if ( self.field % 2 == 0 ) {
							var difference = self.numbers[x - 1] - self.numbers[x - 2];
							if ( difference <= 0 ) {
								x--;
							}
						}
						else {
							var difference = self.numbers[x - 1];
							if ( difference <= 0 ) {
								x--;
							}
						}
					}
					
					var numbers = self.numbers;
					var field = self.field;
					var finalHTML = "";
					
					var numbers = self.numbers;
					finalHTML = self.titlePlaceholder;
					finalHTML = finalHTML.replaceAll( "{s}", translate( self.state ) );
					finalHTML = finalHTML.replaceAll( "{y}", self.years[x - 1] );
					finalHTML = finalHTML.replaceAll( "{m}", self.months[x - 1] );
					finalHTML = finalHTML.replaceAll( "{d}", self.days[x - 1] );
					finalHTML = finalHTML.replaceAll( "{n}", numbers[x - 1].toLocaleString( language ) );
					
					if ( self.field % 2 == 1 && self.checkbox.checked && x >= 7 ) {
						var sevenDayMovingAverages = self.sevenDayMovingAverages;
						switch ( languageIndex() ) {
							case 0: {
								finalHTML += "<br>7 day moving average: ";
								break;
							}
							case 1: {
								finalHTML += "<br>Media móvil de 7 días: ";
								break;
							}
							case 2: {
								finalHTML += "<br>7天移动平均：";
								break;
							}
							case 3: {
								finalHTML += "<br>Moyenne mobile sur 7 jours: ";
								break;
							}
							case 4: {
								finalHTML += "<br>7日間の移動平均：";
								break;
							}
						}
						if ( self.field == 3 ) {
							var sevenDayMovingAverage = sevenDayMovingAverages[x - 1].toFixed( 1 );
							if ( sevenDayMovingAverage == parseInt( sevenDayMovingAverage) ) {
								sevenDayMovingAverage = parseInt( sevenDayMovingAverage );
							}
							finalHTML += sevenDayMovingAverage.toLocaleString( language );
						}
						else {
							finalHTML += parseInt( sevenDayMovingAverages[x - 1] + 0.5 ).toLocaleString( language );
						}
					}
					self.titleNode.innerHTML = finalHTML;
					self.xOfMouse = x;
				};
				
				chart.ontouchend = function() {
					var self = this;
					self.resetTitle();
					self.lastXCoordinate = null;
					self.lastYCoordiante = null;
				};
			}
		}
		
		function getField( id ) {
			if ( id == "totalCasesChart" ) {
				return 0;
			}
			else if ( id == "newCasesChart" ) {
				return 1;
			}
			else if ( id == "totalCasesPer100000PeopleChart" ) {
				return 2;
			}
			else if ( id == "newCasesPer100000PeopleChart" ) {
				return 3;
			}
			else if ( id == "totalDeathsChart" ) {
				return 4;
			}
			else if ( id == "newDeathsChart" ) {
				return 5;
			}
			else if ( id == "deathRateChart" ) {
				return 6;
			}
			else {
				return -1;
			}
		}
		
		function displayInsignificantEntries() {
			return displayInsignificantEntriesCheckbox.checked;
		}
		
		function isUpdatedToday( state ) {
			var entry = dataFromToday.getEntry( state );
			var yesterdayEntry = dataFromYesterday.getEntry( state );
			return entry.c - yesterdayEntry.c > 0 || entry.d - yesterdayEntry.d > 0;
		}
		
		function isUSMapVisible() {
			return window.getComputedStyle( colB ).display != "none";
		}
		
		function select0Change() {
			language = select0.value;
			
			var date;
			var time = calendarFromToday.hour + ":";
			if ( calendarFromToday.minute >= 10 ) {
				time += calendarFromToday.minute;
			}
			else {
				time += "0" + calendarFromToday.minute;
			}
			switch ( languageIndex() ) {
				case 0: {
					document.title = "Coronavirus tracker";
					
					dismissUpdateButton.innerHTML = "OK";
					
					rowA2.children[0].children[1].innerHTML = "Display states/territories with less than 2,000 cases.";
					resetChartsButton.innerHTML = "Reset charts";
					
					date = calendarFromToday.month + "/" + calendarFromToday.day + "/" + calendarFromToday.year;
					updateNotification.innerHTML = "An update from " + date + ", " + time 
						+ " ET is currently in effect.";
					lastUpdatedOn = "Last updated on " + date + ", " + time + " ET. Source of data: "
						+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
						+ "worldometers.info/coronavirus/country/us</a>. NOT FOR COMMERICAL USE.";
					break;
				}
				case 1: {
					document.title = "Rastreador de coronavirus";
					
					dismissUpdateButton.innerHTML = "Bueno";
					
					rowA2.children[0].children[1].innerHTML = "Mostrar estados/territorios con menos de 2,000 casos.";
					resetChartsButton.innerHTML = "Restablecer gráficos";
					
					date = calendarFromToday.month + "/" + calendarFromToday.day + "/" + calendarFromToday.year;
					updateNotification.innerHTML = "Una actualización de " + date + ", " + time + 
						" hora del este actualmente está activa.";
					lastUpdatedOn = "Ultima actualización en " + date + ", " + time + " hora del este. Fuente "
						+ "de datos: <a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
						+ "worldometers.info/coronavirus/country/us</a>. NO ES PARA USO COMERCIAL.";
					break;
				}
				case 2: {
					document.title = "冠状病毒追踪器";
					
					dismissUpdateButton.innerHTML = "好的";
					
					rowA2.children[0].children[1].innerHTML = "显示少于2,000个累计确诊的州/领土。";
					resetChartsButton.innerHTML = "重置图表";
					
					date = calendarFromToday.year + "/" + calendarFromToday.month + "/" + calendarFromToday.day;
					updateNotification.innerHTML = "一个从" + date + "，" + time + "东部时间的更新正在生效。";
					lastUpdatedOn = "最后更新时间：" + date + "，" + time + " 东部时间。 数据来源: "
						+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
						+ "worldometers.info/coronavirus/country/us</a>。 不用于商业用途。";
					
					break;
				}
				case 3: {
					document.title = "Traqueur de coronavirus";
					
					dismissUpdateButton.innerHTML = "D'accord";
					
					rowA2.children[0].children[1].innerHTML = "Afficher les états/territoires avec moins de 2 000 cas.";
					resetChartsButton.innerHTML = "Réinitialiser les graphiques";
					
					date = calendarFromToday.month + "/" + calendarFromToday.day + "/" + calendarFromToday.year;
					updateNotification.innerHTML = "Une mise à jour à partir de " + date + ", " + time + 
						" heure de l'Est est actuellement en vigueur.";
					lastUpdatedOn = "Dernière mise à jour à " + date + ", " + time + " heure de l'Est. "
						+ "Source de données: <a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
						+ "worldometers.info/coronavirus/country/us</a>. PAS POUR UN USAGE COMMERCIAL.";
					break;
				}
				case 4: {
					document.title = "コロナウイルストラッカー";
					
					dismissUpdateButton.innerHTML = "よし";
					
					rowA2.children[0].children[1].innerHTML = "2,000件未満の州/地域を表示します。";
					resetChartsButton.innerHTML = "チャートをリセット";
					
					date = calendarFromToday.year + "/" + calendarFromToday.month + "/" + calendarFromToday.day;
					updateNotification.innerHTML = "現在、東部時の" + date + "、" + time + "からの更新が有効です。";
					lastUpdatedOn = "最終更新日は" + date + "、東部時の" + time + "です。データのソース:"
						+ "<a target='_blank' href='http://worldometers.info/coronavirus/country/us'>"
						+ "worldometers.info/coronavirus/country/us</a>。商用目的ではありません。";
					
					break;
				}
			}
			
			for ( var i = 0; i < states.length; i++ ) {
				var state = states[i];
				var option = select2.children[i];
				option.innerHTML = translate( state );
				option.setAttribute( "value", state );
			}
			
			for ( var i = 0; i < charts.length; i++ ) {
				var state = charts[i].state;
				var checked = false;
				if ( i % 2 == 1 ) {
					checked = charts[i].checkbox.checked;
				}
				charts[i].state = null;	// Force reload of data
				updateChart( charts[i], state );
				if ( checked ) {
					charts[i].checkbox.checked = true;
					charts[i].checkbox.onclick();
				}
			}
			
			var dataDisplayHeaderFile = "../data-display-header-" + language + ".html";
			$.get( dataDisplayHeaderFile, function( responseText ) {
				dataDisplayHeaderHTML = responseText;
				refreshDataDisplay();
				loadMap();
				for ( var i = 0; i < charts.length; i++ ) {
					var checked = false;
					if ( i % 2 == 1 ) {
						checked = charts[i].checkbox.checked;
					}
					makeChart( charts[i], charts[i].state, baseWidth - parseInt( base.style.paddingLeft ) 
						- parseInt( base.style.paddingRight ) );
					if ( checked ) {
						charts[i].checkbox.checked = true;
						charts[i].checkbox.onclick();
					}
					if ( i < charts.length - 1 ) {
						charts[i].style.marginBottom = 0.03 * baseWidth + "px";
					}
				}
				updateCookies();
			});
		}
		
		var states = [
			"USA", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
			"District of Columbia", "Florida", "Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
			"Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", 
			"Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", 
			"North Dakota", "Northern Mariana Islands", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", 
			"Rhode Island", "South Carolina", 	"South Dakota", "Tennessee", "Texas", "U.S. Virgin Islands", "Utah", "Vermont", 
			"Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
		];
		var esTranslations = [
			"EE.UU", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
			"Distrito de Columbia", "Florida", "Georgia", "Guam", "Hawái", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", 
			"Kentucky", "Luisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Misisipí", "Misuri", 
			"Montana", "Nebraska", "Nevada", "Nueva Hampshire", "Nueva Jersey", "Nuevo México", "Nueva York", 
			"Carolina del Norte", "Dakota del Norte", "Islas Marianas del Norte", "Ohio", "Oklahoma", "Oregón", "Pensilvania", 
			"Puerto Rico", "Rhode Island", "Carolina del Sur", "Dakota del Sur", "Tennessee", "Texas", 
			"Islas Vírgenes de EE.UU", "Utah", "Vermont", "Virginia", "Washington", "Virginia del Oeste", "Wisconsin", "Wyoming"
		];
		var cnTranslations = [
			"美国", "阿拉巴马州",  "阿拉斯加州", "亚利桑那州", "阿肯色州", "加利福尼亚州", "科罗拉多州", "康涅狄格州", "特拉华州", "哥伦比亚特区",
			"佛罗里达州", "乔治亚州", "关岛", "夏威夷", "爱达荷州", "伊利诺伊州", "印第安纳州", "爱荷华州", "堪萨斯州", "肯塔基州",
			"路易斯安那州", "缅因州", "马里兰州", "马萨诸塞州", "密歇根州", "明尼苏达州", "密西西比州", "密苏里州", "蒙大拿州", 
			"内布拉斯加州", "内华达州", "新罕布什尔州", "新泽西州", "新墨西哥州", "纽约州", "北卡罗来纳州", "北达科他州",
			"北马里亚纳群岛", "俄亥俄州", "俄克拉荷马州", "俄勒冈州", "宾夕法尼亚州", "波多黎各", "罗德岛", "南卡罗来纳州", "南达科他州", 
			"田纳西州", "得克萨斯州", "美属维尔京群岛", "犹他州", "佛蒙特", "弗吉尼亚州", "华盛顿州", "西弗吉尼亚州", "威斯康星州", "怀俄明州"
		];
		var frTranslations = [
			"États-Unis", "Alabama", "Alaska", "Arizona", "Arkansas", "Californie", "Colorado", "Connecticut", "Delaware", 
			"District de Colombie", "Floride", "Géorgie", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", 
			"Kentucky", "Louisiane", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", 
			"Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "Nouveau Mexique", "New York", "Caroline du Nord", 
			"Dakota du Nord", "Îles Mariannes du Nord", "Ohio", "Oklahoma", "Oregon", "Pennsylvanie", "Porto Rico", 
			"Rhode Island", "Caroline du Sud", "Dakota du Sud", "Tennessee", "Texas", "Îles Vierges américaines", "Utah", 
			"Vermont", "Virginie", "Washington", "Virginie-Occidentale", "Wisconsin", "Wyoming"
		];
		var jpTranslations = [
			"米国", "アラバマ", "アラスカ", "アリゾナ", "アーカンザス", "カリフォルニア", "コロラド", "コネチカット", "デラウェア", 
			"コロンビア特別区", "フロリダ", "ジョージア", "グアム", "ハワイ", "アイダホ", "イリノイ", "インディアナ", "アイオワ", 
			"カンザス", "ケンタッキー", "ルイジアナ", "メイン", "メリーランド", "マサチューセッツ", " ミシガン", "ミネソタ", 
			"ミシシッピ", "ミズーリ", "モンタナ", "ネブラスカ", "ネバダ", "ニューハンプシャー", "ニュージャージー", "ニューメキシコ", 
			"ニューヨーク", "ノースカロライナ", "ノースダコタ", "北マリアナ諸島", "オハイオ", "オクラホマ", "オレゴン", "ペンシルベニア",
			"プエルトリコ", "ロードアイランド", " サウスカロライナ", "サウスダコタ", "テネシー", "テキサス", "米国バージン諸島", "ユタ", 
			"バーモント", "バージニア", "ワシントン", "ウェストバージニア", "ウィスコンシン", "ワイオミング"
		];
		function translate( state ) {
			if ( language == "en-US" ) {
				return state;
			}
			for ( var i = 0; i < states.length; i++ ) {
				if ( state == states[i] ) {
					switch ( languageIndex() ) {
						case 1: {
							return esTranslations[i];
						}
						case 2: {
							return cnTranslations[i];
						}
						case 3: {
							return frTranslations[i];
						}
						case 4: {
							return jpTranslations[i];
						}
					}
				}
			}
		}
		
		function updateCookies() {
			var obj = {};
			obj.language = language;
			obj.sortingMethod = sortingMethod;
			obj.displayInsignificantEntries = displayInsignificantEntries();
			var keyValuePairs = document.cookie.split( ';' ); 
			for ( var i = 0; i < keyValuePairs.length; i++ ) {
				document.cookie = keyValuePairs[i] + "= ;expires=Thu, 01 Jan 1970 00:00:00 GMT";
			}
			document.cookie = "userSettings=" + JSON.stringify( obj ) + ";";
			document.cookie = "expires=" + ( Date.now() + 18144000 ) + ";";
		}
		
		function languageIndex() {
			switch ( language ) {
				// the same, but that won't matter; langauge and therefore languageIndex() depend on the VALUE of
				// For example, if the user selects French (option at position 2 in select0), languageIndex() will still 
				case "en-US": {
					return 0;
				}
				case "es-MX": {
					return 1;
				}
				case "zh-CN": {
					return 2;
				}
				case "fr-FR": {
					return 3;
				}
				case "ja-JP": {
					return 4;
				}
				default: {
					return -1;
				}
			}
		}
		
		init();
	});
}) ();
