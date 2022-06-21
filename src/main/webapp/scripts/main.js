function updateR(_r) {
    PARAMETER_R = _r;
}

function checkPoint(_x, _y) {
    return _checkPointOnGraph(_x, _y, PARAMETER_R, metrics, true);
}

function checkPointHit(_x, _y) {
    return _getPointHit(_x, _y, PARAMETER_R);
}