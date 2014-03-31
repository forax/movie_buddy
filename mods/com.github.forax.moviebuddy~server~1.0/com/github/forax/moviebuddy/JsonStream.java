package com.github.forax.moviebuddy;

import java.io.IOError;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Spliterator;
import java.util.function.Consumer;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;

public class JsonStream {
  public interface JsonItem {
    int getInt(String name);
    String getString(String name);
    String toJson();
  }
  
  public static Stream<JsonItem> asStream(Path path) throws IOException {
    LinkedHashMap<String, Object> slotMap = new LinkedHashMap<>();
    JsonItem view = new JsonItem() {
      @Override
      public String getString(String name) {
        return (String)slotMap.get(name);
      }
      @Override
      public int getInt(String name) {
        return (Integer)slotMap.get(name);
      }
      @Override
      public String toString() {
        return slotMap.toString();
      }
      @Override
      public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');
        slotMap.forEach((key, value) -> {
          builder.append('"').append(key).append("\":");
          if (value instanceof String) {
            builder.append('"').append(value).append('"');
          } else {
            builder.append(value);
          }
          builder.append(',');
        });
        if (!slotMap.isEmpty()) {
          builder.setLength(builder.length() - 1);
        }
        return builder.append('}').toString();
      }
    };
    
    JsonFactory jfactory = new JsonFactory();
    JsonParser parser = jfactory.createParser(Files.newBufferedReader(path));
    parser.nextToken();
    
    Stream<JsonItem> stream = StreamSupport.stream(new Spliterator<JsonItem>() {
      @Override
      public boolean tryAdvance(Consumer<? super JsonItem> action) {
        try {
          slotMap.clear();
          while(parser.getCurrentToken() != JsonToken.START_OBJECT) {
            parser.nextToken();
          }
          JsonToken token = parser.nextToken();
          while (token != JsonToken.END_OBJECT) {
            String fieldName = parser.getCurrentName();
            switch(parser.nextToken()) {
            case VALUE_STRING:
              slotMap.put(fieldName, parser.getValueAsString());
              break;
            case VALUE_NUMBER_INT:
              slotMap.put(fieldName, parser.getValueAsInt());
              break;
            default:
              // do nothing
            }
            token = parser.nextToken();
          }
          action.accept(view);
          token = parser.nextToken();
          return token == JsonToken.START_OBJECT;
        } catch(IOException e) {
          try {
            parser.close();
          } catch (IOException e2) {
            // do nothing
          }
          throw new IOError(e);
        }
      }

      @Override
      public Spliterator<JsonItem> trySplit() {
        return null;
      }
      @Override
      public long estimateSize() {
        return Long.MAX_VALUE;
      }
      @Override
      public int characteristics() {
        return NONNULL;
      }
    }, false);
    stream.onClose(() -> {
      try {
        parser.close();
      } catch (IOException e) {
        // do nothing
      }
    });
    return stream;
  }
  
}
