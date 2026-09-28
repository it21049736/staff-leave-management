package com.staffleave.dto;

import lombok.Data;

import java.util.List;

/** Mirrors DRF's PageNumberPagination envelope so the existing React frontend
 *  (which reads data.results / data.count) needs no changes. */
@Data
public class PagedResponse<T> {
    private long count;
    private String next;
    private String previous;
    private List<T> results;

    public PagedResponse(long count, List<T> results) {
        this.count = count;
        this.results = results;
        this.next = null;
        this.previous = null;
    }
}
