// Type definitions for scheduler bot
// Project: 
// Definitions by:
// Kevin Nickolai <nickolaikevin@gmail.com> (https://github.com/KevinNickolai)

export abstract class ScheduleEvent{
    private timeout;
    private name;
    private date

    abstract displayEvent();

}