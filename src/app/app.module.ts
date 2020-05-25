import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { App } from './app';
import { Assembler } from './assembler/assembler';

@NgModule({
    declarations: [
        App,
        Assembler
    ],
    
    imports: [
        BrowserModule,
        FormsModule
    ],
    
    providers: [],
    
    bootstrap: [App]
}) 
export class AppModule { 

}

