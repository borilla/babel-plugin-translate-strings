module.exports.translate = function (str, start, end) {
	start = start || 'T';
	end = end || 'T';

	return start + str + end;
};
