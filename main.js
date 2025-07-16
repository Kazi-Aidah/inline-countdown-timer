const { Plugin, PluginSettingTab, Setting } = require('obsidian');

const MONTHS = {
	january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
	july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

module.exports = class InlineTimePlugin extends Plugin {
	tickInterval = null;
	mutationObserver = null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new InlineTimeSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((element) => {
			this.processTimeTags(element);
		});

		this.tickInterval = setInterval(() => {
			this.updateAllTimers();
		}, 1000);

		this.setupLivePreviewObserver();
	}

	onunload() {
		clearInterval(this.tickInterval);
		this.mutationObserver?.disconnect();
	}

	setupLivePreviewObserver() {
		this.mutationObserver?.disconnect();
		if (this.settings.livePreviewCountdown) {
			this.mutationObserver = new MutationObserver(() => {
				const workspace = document.querySelector(".workspace-leaf-content");
				if (workspace) this.processTimeTags(workspace);
			});
			this.mutationObserver.observe(document.body, { childList: true, subtree: true });
		}
	}

	processTimeTags(element) {
		const regex = /\[!TIME(LEFT|PASSED),\s*START:\s*([^\]]+)\]/gi;
		element.querySelectorAll("p, li, span").forEach((node) => {
			let original = node.innerHTML;
			if (original.includes(`data-time`)) return;
			const replaced = original.replace(regex, (match, mode, dateTimeStr) => {
				dateTimeStr = dateTimeStr.trim();
				const manualDate = this.parseMonthNameDate(dateTimeStr);
				let data;
				if (manualDate) {
					data = {
						mode, year: manualDate.year, month: manualDate.month + 1,
						day: manualDate.day, timeStr: manualDate.timeStr, originalDateStr: null,
					};
				} else {
					const numeric = dateTimeStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?/);
					if (numeric) {
						let [_, A, B, Y, T] = numeric;
						let day = this.settings.dateFormat === 'DD/MM/YYYY' ? +A : +B;
						let month = this.settings.dateFormat === 'DD/MM/YYYY' ? +B : +A;
						data = { mode, year: +Y, month, day, timeStr: T?.trim() || null, originalDateStr: null };
					} else {
						const dt = new Date(dateTimeStr);
						if (!isNaN(dt)) {
							data = { mode, year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate(), timeStr: null, originalDateStr: dateTimeStr };
						} else return match;
					}
				}
				return `<span class="inline-time-timer" data-time='${JSON.stringify(data)}'>⏳ calculating...</span>`;
			});
			if (original !== replaced) node.innerHTML = replaced;
		});
	}

	parseMonthNameDate(str) {
		str = str.toLowerCase();
		let regex1 = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})(?:\s+(.*))?$/;
		let regex2 = /^([a-z]+)\s+(\d{1,2})\s+(\d{4})(?:\s+(.*))?$/;
		let m = str.match(regex1) || str.match(regex2);
		if (!m) return null;
		let day = isNaN(m[1]) ? parseInt(m[2]) : parseInt(m[1]);
		let monthName = isNaN(m[1]) ? m[1] : m[2];
		let year = parseInt(m[3]);
		let timeStr = m[4]?.trim() || null;
		return MONTHS[monthName] != null ? { year, month: MONTHS[monthName], day, timeStr } : null;
	}

	setTimeOnDate(date, timeStr) {
		let hour = 0, minute = 0;
		const t = timeStr.toLowerCase();
		if (/^\d{1,2}(am|pm)$/.test(t)) {
			hour = parseInt(t); if (t.endsWith('pm') && hour !== 12) hour += 12; if (t.endsWith('am') && hour === 12) hour = 0;
		} else if (/^\d{1,2}:\d{2}(am|pm)?$/.test(t)) {
			const parts = t.match(/^(\d{1,2}):(\d{2})(am|pm)?$/); hour = +parts[1]; minute = +parts[2];
			if (parts[3] === 'pm' && hour !== 12) hour += 12;
			if (parts[3] === 'am' && hour === 12) hour = 0;
		} else if (/^\d{3,4}$/.test(t)) {
			hour = parseInt(t.length === 4 ? t.substring(0, 2) : t[0]);
			minute = parseInt(t.length === 4 ? t.substring(2) : t.substring(1));
		} else if (/^\d{1,2}$/.test(t)) hour = parseInt(t);
		date.setHours(hour, minute, 0, 0);
	}

	updateAllTimers() {
		document.querySelectorAll('span.inline-time-timer').forEach(span => {
			const data = JSON.parse(span.getAttribute('data-time'));
			const text = this.getTimeText(data);
			span.textContent = text;
		});
	}

	getTimeText(data) {
		const { mode, year, month, day, timeStr, originalDateStr } = data;
		let dt = originalDateStr ? new Date(originalDateStr) : new Date(year, month - 1, day);
		if (timeStr) this.setTimeOnDate(dt, timeStr);
		const now = new Date();
		let diffMs = mode === 'LEFT' ? dt - now : now - dt;
		if (diffMs < 0) return this.settings.expiredText;

		let rem = Math.abs(diffMs);

		const breakdown = {
			year: Math.floor(rem / (1000 * 60 * 60 * 24 * 365)),
			month: 0,
			day: 0,
			hour: 0,
			minute: 0,
			second: 0,
		};
		rem -= breakdown.year * 365 * 24 * 60 * 60 * 1000;

		breakdown.month = Math.floor(rem / (1000 * 60 * 60 * 24 * 30));
		rem -= breakdown.month * 30 * 24 * 60 * 60 * 1000;

		breakdown.day = Math.floor(rem / (1000 * 60 * 60 * 24));
		rem -= breakdown.day * 24 * 60 * 60 * 1000;

		breakdown.hour = Math.floor(rem / (1000 * 60 * 60));
		rem -= breakdown.hour * 60 * 60 * 1000;

		breakdown.minute = Math.floor(rem / (1000 * 60));
		rem -= breakdown.minute * 60 * 1000;

		breakdown.second = Math.floor(rem / 1000);

		// into smaller units!
		if (!this.settings.unitsDisplay.includes('year')) {
			breakdown.month += breakdown.year * 12;
			breakdown.year = 0;
		}
		if (!this.settings.unitsDisplay.includes('month')) {
			breakdown.day += breakdown.month * 30;
			breakdown.month = 0;
		}
		if (!this.settings.unitsDisplay.includes('day')) {
			breakdown.hour += breakdown.day * 24;
			breakdown.day = 0;
		}
		if (!this.settings.unitsDisplay.includes('hour')) {
			breakdown.minute += breakdown.hour * 60;
			breakdown.hour = 0;
		}
		if (!this.settings.showMinutes) {
			breakdown.second += breakdown.minute * 60;
			breakdown.minute = 0;
		}

		let result = [];
		for (const unit of ['year', 'month', 'day', 'hour', 'minute', 'second']) {
			if (!this.settings.unitsDisplay.includes(unit)) continue;
			if (unit === 'minute' && !this.settings.showMinutes) continue;
			if (unit === 'second' && !this.settings.showSeconds) continue;

			const val = breakdown[unit];
			if (val <= 0) continue;
			result.push(this.settings.shortenedForm ? `${val}${unit[0]}` : `${val} ${unit}${val !== 1 ? 's' : ''}`);
		}
		if (result.length === 0) result.push(this.settings.shortenedForm ? '0s' : '0 seconds');

		return `${result.join(this.settings.separator ? this.settings.separator + ' ' : ' ')} ${mode === 'LEFT' ? this.settings.leftSuffix : this.settings.passedSuffix}`;
	}

	async loadSettings() {
		this.settings = Object.assign(
			{
				dateFormat: 'DD/MM/YYYY',
				unitsDisplay: ['year', 'month', 'day', 'hour', 'minute', 'second'],
				showMinutes: true,
				showSeconds: true,
				shortenedForm: false,
				separator: ',',
				leftSuffix: 'left',
				passedSuffix: 'passed',
				expiredText: '⏰ Time Expired',
				livePreviewCountdown: false,
			},
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setupLivePreviewObserver();
	}
};

class InlineTimeSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Inline Time Tags Settings' });

		new Setting(containerEl)
			.setName('Date Format')
			.setDesc('Choose how dates are parsed: DD/MM/YYYY or MM/DD/YYYY')
			.addDropdown(dropdown =>
				dropdown
					.addOption('DD/MM/YYYY', 'DD/MM/YYYY')
					.addOption('MM/DD/YYYY', 'MM/DD/YYYY')
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					})
			);

		const toggleUnit = (unit, label) => {
			new Setting(containerEl)
				.setName(`Show ${label}`)
				.addToggle(toggle =>
					toggle.setValue(this.plugin.settings.unitsDisplay.includes(unit))
						.onChange(async (value) => {
							const u = this.plugin.settings.unitsDisplay;
							if (value && !u.includes(unit)) u.push(unit);
							if (!value && u.includes(unit)) u.splice(u.indexOf(unit), 1);
							await this.plugin.saveSettings();
						}));
		};

		toggleUnit('year', 'Years');
		toggleUnit('month', 'Months');
		toggleUnit('day', 'Days');
		toggleUnit('hour', 'Hours');

		new Setting(containerEl)
			.setName('Show Minutes')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.showMinutes)
					.onChange(async (value) => {
						this.plugin.settings.showMinutes = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Show Seconds')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.showSeconds)
					.onChange(async (value) => {
						this.plugin.settings.showSeconds = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Shortened Format')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.shortenedForm)
					.onChange(async (value) => {
						this.plugin.settings.shortenedForm = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Units Separator')
			.addText(text =>
				text.setPlaceholder(',')
					.setValue(this.plugin.settings.separator)
					.onChange(async (value) => {
						this.plugin.settings.separator = value;
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Left suffix')
			.addText(text =>
				text.setPlaceholder('left')
					.setValue(this.plugin.settings.leftSuffix)
					.onChange(async (value) => {
						this.plugin.settings.leftSuffix = value.trim() || 'left';
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Passed suffix')
			.addText(text =>
				text.setPlaceholder('passed')
					.setValue(this.plugin.settings.passedSuffix)
					.onChange(async (value) => {
						this.plugin.settings.passedSuffix = value.trim() || 'passed';
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Time Expired Text')
			.addText(text =>
				text.setPlaceholder('⏰ Time Expired')
					.setValue(this.plugin.settings.expiredText)
					.onChange(async (value) => {
						this.plugin.settings.expiredText = value.trim() || '⏰ Time Expired';
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl)
			.setName('Live Preview Countdown')
			.setDesc('IT IS BROKEN!!!')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.livePreviewCountdown)
					.onChange(async (value) => {
						this.plugin.settings.livePreviewCountdown = value;
						await this.plugin.saveSettings();
					}));
	}
}
