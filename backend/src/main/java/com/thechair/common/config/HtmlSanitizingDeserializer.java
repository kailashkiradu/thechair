package com.thechair.common.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import org.springframework.boot.jackson.JsonComponent;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;

@JsonComponent
public class HtmlSanitizingDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null) {
            return null;
        }
        
        // 1. Strip all HTML tags entirely to prevent injection
        String tagStripped = value.replaceAll("<[^>]*>", "");
        
        // 2. Escape standard HTML characters (e.g. converting & to &amp;, < to &lt;, > to &gt;)
        return HtmlUtils.htmlEscape(tagStripped);
    }
}
