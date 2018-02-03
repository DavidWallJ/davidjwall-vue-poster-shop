const LOAD_NUM = 8;

new Vue({
	el: '#app',
	data: {
		total: 0,
		items: [],
		cart: [],
		results: [],
		newSearch: 'cats',
		lastSearch: '',
		loading: false,
		price: 9.39
	},
	computed: {
		// anytime `items` or `results` change this method will run again due to the `computed` name
		noMoreItems: function() {
			return (
				this.items.length === this.results.length && this.results.length > 0
			);
		}
	},
	methods: {
		appendItems() {
			if (this.items.length < this.results.length) {
				var append = this.results.slice(
					this.items.length,
					this.items.length + LOAD_NUM
				);
				this.items = this.items.concat(append);
			}
		},
		onSubmit: function() {
			if (this.newSearch.length) {
				this.items = [];
				this.loading = true;
				this.$http.get(`/search/${this.newSearch}`).then(function(res) {
					this.lastSearch = this.newSearch;
					this.results = res.data;
					this.appendItems();
					this.loading = false;
				});
			}
		},
		addItem: function(index) {
			const item = this.items[index];

			this.total += this.price;
			let found = false;
			// check to see if this item already exists in the current cart list
			for (var i = 0; i < this.cart.length; i++) {
				if (this.cart[i].id === item.id) {
					found = true;
					this.cart[i].qty++;
					break;
				}
			}
			if (!found) {
				this.cart.push({
					id: item.id,
					title: item.title,
					qty: 1,
					price: this.price
				});
			}
		},
		inc: function(item) {
			item.qty++;
			this.total += this.price;
		},
		dec: function(item) {
			item.qty--;
			this.total -= this.price;
			if (item.qty <= 0) {
				for (var i = 0; i < this.cart.length; i++) {
					if (this.cart[i].id === item.id) {
						this.cart.splice(i, 1);
						break;
					}
				}
			}
		}
	},
	filters: {
		currency: function(price) {
			return '$'.concat(price.toFixed(2));
		}
	},
	mounted: function() {
		this.onSubmit();

		// for auto scroll loading
		// set it up on mount
		// because this isn't vue native functionality we need to hack it a bit buy setting up `this`
		var vueInstance = this;
		var myElement = document.getElementById('product-list-bottom');

		var elementWatcher = scrollMonitor.create(myElement);

		elementWatcher.enterViewport(function() {
			vueInstance.appendItems();
		});
	}
});
