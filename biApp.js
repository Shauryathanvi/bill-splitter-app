	const resetBtn = document.getElementById('resetBtn');
	resetBtn.addEventListener('click', function() {
		window.location.reload();
	});
	const totalValueLabel = document.getElementById('totalValueLabel');
	class BillSplitterApp {
		constructor() {
			this.form = document.getElementById('amountForm');
			this.input = document.getElementById('amountInput');
			this.list = document.getElementById('amountList');
			this.errorBox = document.getElementById('errorBox');
			this.totalValueLabel = document.getElementById('totalValueLabel');
			this.nextBtn = document.getElementById('nextBtn');
			this.discountSection = document.getElementById('discountSection');
			this.discountInput = document.getElementById('discountInput');
			this.discountAmountRadio = document.getElementById('discountAmount');
			this.discountPercentRadio = document.getElementById('discountPercent');
			this.discountErrorBox = document.getElementById('discountErrorBox');
			this.discountNextBtn = document.getElementById('discountNextBtn');
			this.resetBtn = document.getElementById('resetBtn');
			this.buttons = document.querySelectorAll('button');
			this.hoverSound = new Audio('Media/GTA.mp3');
			this.originalPrices = [];
			this.originalTotalPrice = 0;
			this.init();
		}

		init() {
			this.resetBtn.addEventListener('click', () => window.location.reload());
			this.buttons.forEach(btn => {
				btn.addEventListener('mouseenter', () => {
					this.hoverSound.currentTime = 0;
					this.hoverSound.play();
				});
				btn.style.fontFamily = "'GTAFont2', Arial, sans-serif";
				btn.style.fontSize = "1.1rem";
			});
			this.form.addEventListener('submit', e => this.handleAmountSubmit(e));
			this.nextBtn.addEventListener('click', () => this.showDiscountSection());
			this.discountInput.addEventListener('keydown', e => {
				if (e.key === 'Enter') {
					e.preventDefault();
					this.validateDiscountInput();
					this.discountPriceCalculations();
				}
			});
			this.discountNextBtn.addEventListener('click', () => {
				this.validateDiscountInput();
				this.discountPriceCalculations();
			});
		}

		handleAmountSubmit(e) {
			e.preventDefault();
			try {
				const value = this.input.value.trim();
				const isValid = this.inputValidate(value);
				if (!isValid) {
					this.errorBox.textContent = 'Invalid input please try again';
					this.errorBox.classList.add('is-visible');
					this.input.value = '';
					return;
				}
				this.errorBox.classList.remove('is-visible');
				const addWarning = document.getElementById('addAfterDiscountWarning');
				if (this.discountSection.classList.contains('is-visible')) {
					addWarning.textContent = 'Hit the Calculate button next to discount text box to calculate the new prices';
					addWarning.style.display = 'block';
				} else {
					addWarning.textContent = '';
					addWarning.style.display = 'none';
				}
				const li = document.createElement('li');
				li.textContent = value;
				this.list.appendChild(li);
				this.originalPrices.push(parseFloat(value));
				this.originalTotalPrice = this.originalPrices.reduce((acc, curr) => acc + curr, 0);
				const fmt = new Intl.NumberFormat(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
				this.totalValueLabel.textContent = `Total Value: ${fmt.format(this.originalTotalPrice)}`;
				this.input.value = '';
			} catch (e) {
				this.errorBox.textContent = 'Unknown error occurred, please try again';
				this.errorBox.classList.add('is-visible');
			}
		}

		validateDiscountInput() {
			try {
				const value = this.discountInput.value.trim();
				let isValid = this.inputValidate(value);
				if (this.discountPercentRadio.checked && parseFloat(value) > 100) {
					isValid = false;
				}
				if (!isValid) {
					this.setDiscountError(this.discountPercentRadio.checked
						? 'Enter a positive number up to 100'
						: 'Invalid input please try again');
				} else if (this.discountAmountRadio.checked && parseFloat(value) > this.originalTotalPrice) {
					this.setDiscountError('Discount amount cannot be greater than total');
				} else {
					this.clearDiscountError();
				}
			} catch (e) {
					this.setDiscountError('Unknown error occurred, please try again');
			}
		}

		discountPriceCalculations() {
			// only proceed when there is no visible discount error
			if (!this.discountErrorBox.classList.contains('is-visible')) {
				let discountAmount = 0;
				const discountValue = parseFloat(this.discountInput.value.trim());
				if (this.discountAmountRadio.checked) {
					discountAmount = parseFloat(discountValue.toFixed(2));
				} else if (this.discountPercentRadio.checked) {
					discountAmount = parseFloat(((discountValue / 100) * this.originalTotalPrice).toFixed(2));
				}
				const discountedPrices = this.giveNewPrices(this.originalPrices, discountAmount, this.originalTotalPrice);
				let discountedList = document.getElementById('discountedList');
				discountedList.innerHTML = '';
				const fmt = new Intl.NumberFormat(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
				discountedPrices.forEach((value, idx) => {
					const li = document.createElement('li');
					li.textContent = `discounted price: ${value}, original price: ${fmt.format(this.originalPrices[idx])}`;
					discountedList.appendChild(li);
				});
				// compute and show discounted total
				// const numericDiscounted = discountedPrices.map(d => parseFloat(d));
				// const discountedTotal = numericDiscounted.reduce((acc, cur) => acc + cur, 0);
				const discountedTotal = (this.originalTotalPrice - discountAmount).toFixed(2);
				const discountedTotalLabel = document.getElementById('discountedTotalLabel');
				if (discountedTotalLabel) {
					discountedTotalLabel.textContent = `Discounted Total: ${fmt.format(discountedTotal)}`;
				}
			}
		}

		showDiscountSection() {
			if (this.originalPrices.length === 0) {
				this.errorBox.textContent = 'Add at least one amount before applying a discount';
				this.errorBox.classList.add('is-visible');
				return;
			}
			this.errorBox.classList.remove('is-visible');
			this.discountSection.classList.add('is-visible');
		}

		setDiscountError(msg) {
			this.discountErrorBox.textContent = msg;
			this.discountErrorBox.classList.add('is-visible');
		}

		clearDiscountError() {
			this.discountErrorBox.textContent = '';
			this.discountErrorBox.classList.remove('is-visible');
		}

		inputValidate(inpValue) {
			const isValid = /^([1-9]\d*|0)?(\.\d+)?$/.test(inpValue) && parseFloat(inpValue) > 0;
			return isValid;
		}

		giveNewPrices(priceArray, discount, total) {
			return priceArray.map(p => {
				const discounted = p - ((p / total) * discount);
				return discounted.toFixed(2);
			});
		}
	}


		new BillSplitterApp();
