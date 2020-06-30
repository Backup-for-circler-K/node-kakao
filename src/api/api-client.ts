/*
 * Created on Mon May 11 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import * as request from "request-promise";

import { KakaoAPI } from "../kakao-api";
import { JsonUtil } from "../util/json-util";
import { AccessDataProvider } from "../oauth/access-data-provider";
import { MoreSettingsStruct, LessSettingsStruct } from "../talk/struct/api/account/client-settings-struct";
import { ObjectMapper, Serializer } from "json-proxy-mapper";
import { ApiStruct } from "../talk/struct/api/api-struct";
import { LoginTokenStruct } from "../talk/struct/api/account/login-token-struct";
import { Long } from "bson";
import { FriendReqStruct } from "../talk/struct/api/friends/friend-req-struct";
import { FriendListStruct } from "../talk/struct/api/friends/friend-list-struct";
import { FriendFindIdStruct, FriendFindUUIDStruct } from "../talk/struct/api/friends/friend-find-struct";
import { FriendDeleteStruct } from "../talk/struct/api/friends/friend-delete-struct";
import { FriendBlockedListStruct } from "../talk/struct/api/friends/friend-blocked-list-struct";
import { FriendSearchStruct } from "../talk/struct/api/friends/friend-search-struct";
import { FriendNicknameStruct } from "../talk/struct/api/friends/friend-nickname-struct";
import { ProfileReqStruct } from "../talk/struct/api/profile/profile-req-struct";
import { WebApiClient, RequestHeader } from "./web-api-client";
import { LoginClient } from "../client";
import { SessionHeaderDecorator } from "./api-header-decorator";

export class ApiClient extends WebApiClient {

    private sessionHeaderDecorator: SessionHeaderDecorator;

    constructor(
        client: LoginClient
    ) {
       super();

       this.sessionHeaderDecorator = new SessionHeaderDecorator(client);
    }

    get Host() {
        return KakaoAPI.ServiceURL;
    }
    
    protected fillHeader(header: RequestHeader) {
        super.fillHeader(header);

        this.sessionHeaderDecorator.fillHeader(header);
    }

    // account

    async requestMoreSettings(since: number = 0, language: string = KakaoAPI.Language): Promise<MoreSettingsStruct> {
        return this.request('GET', `${ApiClient.getAccountApiPath('more_settings.json')}?since=${since}&lang=${language}`);
    }

    async requestLessSettings(since: number = 0, language: string = KakaoAPI.Language): Promise<LessSettingsStruct> {
        return this.request('GET', `${ApiClient.getAccountApiPath('less_settings.json')}?since=${since}&lang=${language}`);
    }

    async requestWebLoginToken(): Promise<LoginTokenStruct> {
        return this.request('GET', ApiClient.getAccountApiPath('login_token.json'));
    }

    // friends

    async addFriend(id: Long, pa: string = ''): Promise<FriendReqStruct> {
        return this.request('GET', `${ApiClient.getFriendsApiPath('add')}/${id}.json?pa=${pa}`);
    }

    async removeFriend(id: Long): Promise<FriendReqStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('purge.json'), { id: id.toString() });
    }

    async removeFriendList(idList: Long[]): Promise<FriendDeleteStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('delete.json'), { ids: JsonUtil.stringifyLoseless(idList) });
    }

    async hideFriend(id: Long, pa: string = ''): Promise<ApiStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('hide.json'), { id: id.toString(), pa: pa });
    }

    async unhideFriend(id: Long): Promise<ApiStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('unhide.json'), { id: id.toString() });
    }

    async searchFriends(query: string, pageNum?: number, pageSize?: number): Promise<FriendSearchStruct> {
        if (pageNum && pageSize) return this.request('GET', ApiClient.getFriendsApiPath('search.json'), { query: query, page_num: pageNum, page_size: pageSize });

        return this.request('GET', ApiClient.getFriendsApiPath('search.json'), { query });
    }

    async findFriendById(id: Long): Promise<FriendFindIdStruct> {
        return this.request('GET', ApiClient.getFriendsApiPath(`${id.toString()}.json`)); // 200 iq logics
    }

    async findFriendByUUID(uuid: string): Promise<FriendFindUUIDStruct> {
        return this.request('GET', `${ApiClient.getFriendsApiPath('find_by_uuid.json')}`, { uuid: uuid });
    }

    async requestFriendList(types: string[] = [ 'plus', 'normal' ], eventTypes: string[] = [ 'create' ], token: Long = Long.ZERO): Promise<FriendListStruct> {
        return this.request('GET', `${ApiClient.getFriendsApiPath('list.json')}`, { type: JSON.stringify(types), event_types: JSON.stringify(eventTypes), token: token.toString() });
    }

    async requestBlockedFriendList(): Promise<FriendBlockedListStruct> {
        return this.request('GET', `${ApiClient.getFriendsApiPath('blocked.json')}`);
    }

    async setNickname(id: Long, nickname: string): Promise<FriendNicknameStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('nickname.json'), { id: id.toString(), nickname: nickname });
    }

    async addFavoriteFriends(idList: Long[]): Promise<ApiStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('add_favorite.json'), { ids: JsonUtil.stringifyLoseless(idList) });
    }

    async removeFavoriteFriend(id: Long): Promise<ApiStruct> {
        return this.request('POST', ApiClient.getFriendsApiPath('remove_favorite.json'), { id: id.toString() });
    }

    // profile

    async requestMyProfile(): Promise<ProfileReqStruct> {
        return this.request('GET', ApiClient.getProfile3ApiPath('me.json'));
    }

    async requestProfile(id: Long): Promise<ProfileReqStruct> {
        return this.request('GET', `${ApiClient.getProfile3ApiPath('friend_info.json')}?id=${id}`);
    }

    static getAccountApiPath(api: string) {
        return `${KakaoAPI.Agent}/account/${api}`;
    }

    static getFriendsApiPath(api: string) {
        return `${KakaoAPI.Agent}/friends/${api}`;
    }

    static getProfile3ApiPath(api: string) {
        return `${KakaoAPI.Agent}/profile3/${api}`;
    }

}