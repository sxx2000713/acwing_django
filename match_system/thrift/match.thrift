namespace py match_services

service Match{
    i32 add_player(1:i32 score, 2:string uid, 3:string username, 4:string photo, 5:string channel_name, 6:i32 rank),
    i32 remove_player(1:i32 score, 2:string uid, 3:string username, 4:string photo, 5:string channel_name, 6:i32 rank),
}