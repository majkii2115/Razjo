import { Family } from './../auth/UserObjG';
import { Location } from '@angular/common';
import { GetLastVisits } from './models/GetLastVisits';
import { IGetVisitsforMonth } from './models/IGetVisitsForMonth';
import { GetNotesforMonth } from './models/CalGetNotesForMonth';
import { IGetNotesforMonth } from './models/ICalGetNotesForMonth';
import { CalendarserviceService } from './calendarservice.service';
import { NotesService } from './../addnote/notes.service';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarView } from 'angular-calendar';
import { reduce } from 'rxjs/operators';
import { colors } from './utils/colors';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendarview',
  templateUrl: './calendarview.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./calendarview.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarviewComponent implements OnInit {

  // tslint:disable-next-line: max-line-length
  constructor(private notesService: NotesService, private calendarService: CalendarserviceService, private location: Location, private ref: ChangeDetectorRef ) { }

  //#region variables
  locale = 'pl';
  view: CalendarView = CalendarView.Month;
  refresh: Subject<any> = new Subject();
  viewDate: Date = new Date();
  events: CalendarEvent[] = [{
    title: 'test',
    color: colors.yellow,
    start: new Date()
  }];
  clickedDate: Date;
  clickedColumn: number;
  overlay;
  hasManyFamilies: boolean;
  hasAnyFamily: boolean;
  families: Family[] = [];
  isPSY = false;
  selector: HTMLSelectElement;
  selectorVisit: HTMLSelectElement;
  selectorNote: HTMLSelectElement;
  dataNote: HTMLInputElement;
  dataVisit: HTMLInputElement;
  noteText: HTMLInputElement;
//#endregion

  addEvent(date: any): void {

    console.log(date);
    // this.refresh.next();
  }

  ngOnInit(): void {
    this.events = this.calendarService.events;
    this.calendarService.headerToToken();
    this.calendarService.familyHandler();
    if (localStorage.getItem('role') === 'PSY') { this.isPSY = true; }
    this.families = JSON.parse(localStorage.getItem('x'));
    this.fetchForNotes();
  }

  fetchElements()
  {
    this.selector = document.getElementById('sel') as HTMLSelectElement; // selektor rodziny kalendarza
    this.selectorVisit = document.getElementById('selVisit') as HTMLSelectElement; // selektor wizyty
    this.selectorNote = document.getElementById('selNote') as HTMLSelectElement; // selektor notatki
    this.dataNote = document.getElementById('InputData0') as HTMLInputElement;
    this.dataVisit = document.getElementById('InputData1') as HTMLInputElement;
    this.noteText = document.getElementById('textBox') as HTMLInputElement;
  }

  fetchForNotes()
  {
    // ! spr ilości rodzin
    if (this.families.length === 0)
    {
      this.hasAnyFamily = false;
      this.hasManyFamilies = false;
    }
    else if (this.families.length === 1)
    {
      this.hasAnyFamily = true;
      this.hasManyFamilies = false;
      this.getNotesForThisMonth(this.calendarService.familyId);
      this.getVisitsForThisMonth(this.calendarService.familyId);
      this.refresh.next();
    }
    else if (this.families.length > 1)
    {
      this.hasAnyFamily = true;
      this.hasManyFamilies = true;
      this.fetchElements();
      this.getNotesForThisMonth(this.families[0].familyId);
      this.getVisitsForThisMonth(this.families[0].familyId);
      this.refresh.next();
    }
  }
  testEventSystem()
  {
    console.log(this.events);
    this.fetchElements();
    console.log(this.selector.selectedIndex);
  }
  back()
  {
    this.location.back();
  }
  logOut()
  {
    this.notesService.logOut();
  }

//#region calendarservice
// tslint:disable: prefer-const
  // !CalendaService
  getNotesForThisMonth(familyId: string)
  {
    let $res: GetNotesforMonth[];
    let $tab: CalendarEvent;
    this.calendarService.getLastNotes(familyId).subscribe({
      next: data => {
        $res = data;
        this.overlay = false;
        // TODO: Przerabianie notatek;
        data.forEach(element => {
          $tab = {
            title: 'Notatka',
            color: colors.yellow,
            start: new Date(parseInt(element.date.year, 10), parseInt(element.date.month, 10) - 1, parseInt(element.date.day, 10)),
            allDay: true
          };
          this.events.push($tab);
          this.loopThroughObj(this.events);
        });
        this.calendarService.events = this.events;
        this.events = this.calendarService.events;
        this.overlay = false;
        console.log(this.events);
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Wystąpił błąd!',
          text: 'Wystąpił błąd pobierania danych',
          footer: err.error.errors
        });
      }
    });
  }

  getVisitsForThisMonth(familyId: string)
  {
    let $res: GetLastVisits[];
    let $tab: CalendarEvent;
    //
    this.calendarService.getLastVisits(familyId).subscribe({
      next: data => {
        $res = data;
        this.overlay = false;
        // TODO: Przerabianie wizyt;
        data.forEach(element => {
          $tab = {
            title: 'Wizyta',
            color: colors.red,
            start: new Date(parseInt(element.date.year, 10), parseInt(element.date.month, 10) - 1, parseInt(element.date.day, 10)),
            allDay: true
          };
          this.events.push($tab);
          this.loopThroughObj(this.events);
        });
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Wystąpił błąd!',
          text: 'Wystąpił błąd pobierania danych',
          footer: err.error.errors
        });
      }
    });
  }

  // !
//#endregion

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
    }

    loopThroughObj(res){
      let obj: Array<any> = [];
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < res.length; i++) {
        // tslint:disable-next-line: ban-types
        let event: Object = {
          id: res[i].id,
          title: res[i].title,
          color: res[i].color,
          repeating: res[i].repeating,
          start: new Date(res[i].start),
          end: new Date(res[i].end)
        };
        obj.push(event);
      }
      this.events = obj;
      this.refresh.next();
    }
}

