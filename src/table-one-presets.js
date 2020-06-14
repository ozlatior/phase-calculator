const styles = {

	"single-double-border": {
		borders: {
			header: {
				corner: [ "++" ],
				outer: [ "||", "=" ],
				outerCross: [ "+" ],
				inner: [ "|", "-" ],
				innerCross: [ "+" ]
			},
			index: {
				corner: [ "++" ],
				outer: [ "||", "=" ],
				outerCross: [ "+" ],
				inner: [ "|", "-" ],
				innerCross: [ "+" ]
			},
			body: {
				corner: [ "++" ],
				outer: [ "||", "=" ],
				outerCross: [ "+" ],
				inner: [ "|", "-" ],
				innerCross: [ "+" ]
			},
			table: {
				corner: [ "++" ],
				outer: [ "||", "=" ],
				outerCross: [ "+" ],
				inner: [ "|", "-" ],
				innerCross: [ "+" ]
			}
		},
		text: {
			header: {
				bold: true,
				align: "center"
			},
			index: {
				bold: true,
				align: "right"
			},
			table: {
				bold: false,
				casing: "none"
			}
		},
		size: {
		},
		colors: {
			table: {
				border: {
					color: "red"
				},
				text: {
					color: "yellow"
				}
			},
			header: {
				border: {
					bold: true
				},
				text: {
					color: "green",
					bold: true
				}
			},
			index: {
				text: {
					color: "blue",
					bold: true
				}
			}
		}
	},

	default: "single-double-border"

};

module.exports.styles = styles;
