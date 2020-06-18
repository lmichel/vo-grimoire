try {
    var piwikInternalSiteId = 0;
    if (piwikSiteId) {
        piwikSiteId = piwikSiteId.toLowerCase();    
    }
    switch (piwikSiteId) {
        case "annotations" :
            piwikInternalSiteId = 1;
            break;
        case "aladin" :
            piwikInternalSiteId = 2;
            break;
        case "portal" :
            piwikInternalSiteId = 3;
            break;
        case "simbad" :
            piwikInternalSiteId = 4;
            break;
        case "vizier" :
            piwikInternalSiteId = 5;
            break;
        case "simplay" :
            piwikInternalSiteId = 6;
            break;
        case "cdsweb" :
            piwikInternalSiteId = 7;
            break;
        case "saada" :
            piwikInternalSiteId = 8;
            break;
        case "sscdb" :
            piwikInternalSiteId = 9;
            break;
        case "footprints" :
            piwikInternalSiteId = 10;
            break;
        case "xmatch" :
            piwikInternalSiteId = 11;
            break;
        case "querycat" :
            piwikInternalSiteId = 12;
            break;
        case "ovfrance" :
            piwikInternalSiteId = 13;
            break;
        case "rescorner" :
            piwikInternalSiteId = 14;
            break;
        case "cdsbib" :
            piwikInternalSiteId = 15;
            break;
        case "dic" :
            piwikInternalSiteId = 16;
            break;
        case "tapvizier" :
            piwikInternalSiteId = 17;
            break;
        case "astrodeep" :
            piwikInternalSiteId = 18;
            break;
            
    }
} catch( err ) {}
