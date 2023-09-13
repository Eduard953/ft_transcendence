import { Options } from './static/options.js';
import { Side, GameCmd, GameCommand, BrowserMsg, Player, Partners } from './static/common.js';
import { Pong } from './pong.js';
export function newPlayer(socket, players, nickname, nick_name) {
    var _a;
    if (!(!nickname && !nick_name)) {
        if (!nickname) {
            nickname = nick_name;
        }
        players.set(socket.id, new Player(socket.id, nickname, Side.RIGHT));
        socket.emit('player created', nickname);
        if (Options.debug)
            console.log((_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname, 'new player');
        nickname = '';
    }
    else {
        socket.emit('player not crated');
        nickname = '';
    }
}
export function disconnect(socket, players, pongs, reason) {
    var _a;
    const playerNickname = (_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname;
    if (players.delete(socket.id) && Options.debug) {
        console.log(playerNickname, reason);
    }
    const pong = pongs.get(socket.id);
    if (pong) {
        let msg = new BrowserMsg;
        msg.cmd = GameCmd.STOP;
        pong.setControls(msg, undefined);
        pongs.delete(socket.id);
    }
}
export function getPartnersList(socket, players, pongs) {
    if (!players.has(socket.id)) {
        return;
    }
    const partners = new Partners;
    const partnersList = partners.getPartnersList(pongs, socket.id);
    socket.emit('partners list', partnersList);
    if (Options.debug)
        console.log(partnersList);
}
export function controls(socket, players, pongs, msg) {
    const player = players.get(socket.id);
    if (Options.debug && msg.paddle_y == 0 && msg.cmd != GameCmd.MOUSE) {
        console.log(player === null || player === void 0 ? void 0 : player.nickname, GameCommand[msg.cmd], 'controls');
    }
    if (!player) {
        return;
    }
    let pong = pongs.get(socket.id);
    if (pong) {
        if (msg.cmd == GameCmd.STOP) {
            pong.setControls(msg, player.side);
            pongs.delete(socket.id);
            socket.emit('pong deleted');
        }
        else if (msg.cmd == GameCmd.NEW && (!pong.leftPlayer || !pong.rightPlayer)) {
            return;
        }
        else {
            pong.setControls(msg, player.side);
            socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
        }
    }
    else if (msg.cmd == GameCmd.AUTO || msg.cmd == GameCmd.TRNNG) {
        pong = new Pong;
        player.side = Side.RIGHT;
        pong.setOwner(player);
        socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
        pongs.set(socket.id, pong);
        socket.emit('pong launched');
    }
}
export function state(socket, players, pongs) {
    const player = players.get(socket.id);
    const pong = pongs.get(socket.id);
    if (player && pong) {
        socket.emit('state', pong.getPongState(player.side));
    }
}
export function partnerChoosed(socket, io, players, socket_id) {
    var _a;
    if (!players.has(socket.id)) {
        return;
    }
    const partnerSocket = io.sockets.sockets.get(socket_id);
    if (partnerSocket && players.has(partnerSocket.id)) {
        partnerSocket.emit('confipm partner', [socket.id, (_a = players.get(socket.id)) === null || _a === void 0 ? void 0 : _a.nickname]);
    }
    else {
        socket.emit('partner unavailable');
    }
}
export function partnerConfirmation(socket, io, players, pongs, socket_id) {
    if (!players.has(socket.id)) {
        return;
    }
    const partnerSocket = io.sockets.sockets.get(socket_id);
    if (!partnerSocket) {
        socket.emit('partner unavailable');
        return;
    }
    const partner = players.get(partnerSocket.id);
    if (!partner) {
        socket.emit('partner unavailable');
        return;
    }
    const pong = pongs.get(socket.id);
    if (pong) {
        if (pongs.delete(partnerSocket.id)) {
            partnerSocket.emit('pong deleted');
        }
        partner.side = pong.setPartner(partner);
        socket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
        partnerSocket.emit('players', [pong.leftPlayer, pong.rightPlayer]);
        // pongs.set(partnerSocket.id, pong);
        partnerSocket.emit('pong launched');
    }
    else {
        partnerSocket.emit('partner unavailable');
    }
}
export function refusal(socket, io, players, socket_id) {
    if (!players.has(socket.id)) {
        return;
    }
    const partnerSocket = io.sockets.sockets.get(socket_id);
    if (partnerSocket) {
        // partnerSocket.emit('partner unavailable');
    }
}
