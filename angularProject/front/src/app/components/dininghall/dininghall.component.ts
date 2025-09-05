import {
    type AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Input,
    type OnInit,
} from '@angular/core';
import { BehaviorSubject, Subscription, debounceTime } from 'rxjs';
import { AppService, SwitchDininghallService } from '../../services';

@Component({
    selector: 'app-dininghall',
    templateUrl: './dininghall.component.html',
    styleUrls: ['./dininghall.component.css'],
})
export class DininghallComponent implements OnInit, AfterViewInit {
    @Input() text!: string;
    @Input() show!: boolean;
    @Input() short!: string;
    showTitleText = false;
    headers: any;
    private animationListener = new BehaviorSubject<any>('a0');
    private sub: Subscription = new Subscription();
    b1 = true;
    b2 = false;
    b3 = false;
    b4 = false;
    emptyDisplay = false;
    skeletonLoader = false;
    subclosed = false;
    @HostListener('window:resize', []) //might be unnecessary
    clarifyTab() {
        if (window.innerWidth <= 418) {
            this.showTitleText = true;
        } else {
            this.showTitleText = false;
        }
    }

    constructor(
        private elementRef: ElementRef,
        private appService: AppService,
        private sds: SwitchDininghallService,
    ) {}

    ngOnInit(): void {
        //thi
        this.headers = this.appService.getHeaders(this.short);
        if (window.innerWidth <= 418) {
            this.showTitleText = true;
        } else {
            this.showTitleText = false;
        }
        let shortname: string;
        this.sds.observable.asObservable().subscribe((res) => {
            shortname = res;
            this.animationListener
                .asObservable()
                .pipe(debounceTime(100))
                .subscribe((res) => {
                    //test that only 1 is calling this
                    if (this.short != shortname || this.subclosed) {
                        //try to figure out a way to maybe unsubscribe instead of doing this.
                        if (!this.animationListener.closed) {
                            this.animationListener.next('a0');
                        }
                        this.b1 = true;
                        this.b2 = false;
                        this.b3 = false;
                        this.b4 = false;
                        return;
                    }
                    switch (this.animationListener.value) {
                        case 'a0': {
                            setTimeout(() => {
                                if (this.subclosed) return;
                                this.animationListener.next('a1');
                                this.b2 = true;
                            }, 200);
                            break;
                        }
                        case 'a1': {
                            setTimeout(() => {
                                if (this.subclosed) return;
                                this.animationListener.next('a2');
                                this.b3 = true;
                            }, 300);
                            break;
                        }

                        case 'a2': {
                            setTimeout(() => {
                                if (this.subclosed) return;
                                this.animationListener.next('a3');
                                this.b4 = true;
                            }, 250);
                            break;
                        }
                        case 'a3': {
                            setTimeout(() => {
                                if (this.subclosed) return;
                                this.animationListener.next('a0');
                                this.b3 = false;
                                this.b2 = false;
                                this.b1 = false;
                                setTimeout(() => {
                                    this.b1 = true;
                                    this.b4 = false;
                                }, 400);
                            }, 1400);
                            break;
                        }
                    }
                });
        });
        const dataloadedState = this.appService.dataLoaded.subscribe((res) => {
            if (res) {
                this.skeletonLoader = false;
                const items = this.appService.getData(this.short);
                if (!items || items?.length === 0) {
                    this.emptyDisplay = true;
                }
                //dataloadedState.unsubscribe();
            } else {
                this.skeletonLoader = true;
            }
        });
        this.sub.add(dataloadedState);
    }

    get animationState() {
        return this.animationListener.value;
    }

    getProperBooleanForAnimation(i: number): boolean {
        switch (i) {
            case 0: {
                return this.b1;
            }
            case 1: {
                return this.b2;
            }
            case 2: {
                return this.b3;
            }
            case 3: {
                return this.b4;
            }
        }
        throw new Error();
    }

    ngAfterViewInit(): void {
        //this.elementRef.nativeElement.querySelector("div > h2").addEventListener('click', this.changeStyling.bind(this))
    }

    ngOnDestroy(): void {
        this.subclosed = true;
        this.animationListener.unsubscribe();
        this.sds.observable.unsubscribe();
        this.sub.unsubscribe();
        this.sds.reinstantiate();
    }

    //create interface that simulates runk/ohill/newcomb dining data api fetch content
}
